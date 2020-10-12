import re
import datetime
import requests
from bs4 import BeautifulSoup
import pandas as pd

class LecturesData(object):
    '''
    获取info讲座的数据
    '''
    COLUMNS = ['title', 'reporter', 'time', 'place', 'holder', 'content', 'url']
    def __init__(self):
        self.root_url = "https://kyybgxx.cic.tsinghua.edu.cn/kybg/xsgg/"
        self.root = requests.get(self.root_url)
        self.root_bs = BeautifulSoup(self.root.text, 'lxml')
        self.raw_columns = ['报告题目:', '报告人:', '报告时间:', '报告地点:', '主办单位:', '内容:', '链接:']
        self.columns = ['title', 'reporter', 'time', 'place', 'holder', 'content', 'url']
        self.col_dict = dict(zip(self.raw_columns, self.columns))
    
    def get_lectures_details(self, detail_url:str):
        """
        根据传入的讲座详情页url进行解析，提取出指定的列
        Parameter:
            detail_url: str, 详情网页的url

        Return:
            dict
        """
        detail_page=requests.get(detail_url)
        detail_bs = BeautifulSoup(detail_page.text, 'lxml')
        detail_trs = detail_bs.find_all('tr')
        detail_tr_dict = {}
        for tr in detail_trs:
            tds = tr.find_all('td')
            if len(tds) <= 0:
                continue
            node = tds[0].find('div')
            if node is not None and node.string is not None:
                s = node.string.strip()
                if s in self.raw_columns:
                    col = self.col_dict[s]
                    if col == 'content':
                        detail_tr_dict['content'] = '\n'.join(tds[1].text.split())
                    else:
                        detail_tr_dict[col] = tds[1].string
        if len(detail_tr_dict['time'].strip()) == 16:
            detail_tr_dict['time'] = int(datetime.datetime.strptime(detail_tr_dict['time'].strip(), "%Y-%m-%d %H:%M").timestamp())
        else:
            #如果格式不对则标记为-1留空
            detail_tr_dict['time'] = -1
        detail_tr_dict['url'] = detail_url
        return detail_tr_dict

    def get_lectures_tag(self, tag_node, page_count:int=-1):
        """
        根据传入的讲座tag的node进行解析
        Parameter:
            tag_node: bs4.element.Tag, 
            page_count: int, 读取的页数 

        Return:
            list of dict
        """
        tag_data_list=[]
        tag_url = tag_node['href']
        tag_url = self.root_url + tag_url
        tag_page = requests.get(tag_url)
        count = 0
        while True:
            tag_bs = BeautifulSoup(tag_page.text, 'lxml')
            lec_trs = tag_bs.find_all('tr')
            for tr in lec_trs:
                # if tr.get('bgcolor', None) is None or tr.get('class', None) is not None:
                #     continue
                tds = tr.find_all('td')
                if tds is None or len(tds) < 2:
                    continue
                a = tds[1].find('a')
                if a is None:
                    continue
                detail_url = a.get('href')
                if 'detail' not in detail_url:
                    continue
                detail_url = self.root_url + detail_url
                print(detail_url)
                tag_data_list.append(self.get_lectures_details(detail_url))
                # 测试用代码，限制读取条数减少用时
                # if len(tag_data_list) > 4:
                #     print(pd.DataFrame(tag_data_list))
                #     break
            nextpage_node=tag_bs.find(name='a', string=re.compile('.*下.*页.*'))
            if nextpage_node is None:
                break
            nextpage_url = self.root_url + nextpage_node['href']
            tag_page = requests.get(nextpage_url)
            count += 1
            if page_count > 0 and count >= page_count:
                break
        return tag_data_list

    def get_lectures_data(self, tag_count:int=-1, page_count:int=-1):
        """
        读取分tag的讲座信息
        Parameter:
            tag_count: int, 读取的tag数 
            page_count: int, 读取的页数 

        Return:
            dict of pd.DataFrame
        """
        root_trs = self.root_bs.find_all(name='td', id=re.compile("category[0-9][0-9][0-9][0-9].+"))
        data_dict = {}
        count = 0
        for tag_root in root_trs:
            tag_node = tag_root.find('a')
            if tag_node is None:
                break
            tag = tag_node.string
            data_dict[tag] = []
            data_dict[tag] = pd.DataFrame.from_records(self.get_lectures_tag(tag_node, page_count))
            count += 1
            if count >= tag_count:
                break
        return data_dict


if __name__ == "__main__":
    #约需要5min
    lecturesdata = LecturesData()
    result = lecturesdata.get_lectures_data(tag_count=2, page_count=2)
    for key in result:
        print(result[key].head())