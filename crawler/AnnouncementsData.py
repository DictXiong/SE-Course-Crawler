import re
import datetime
import requests
from bs4 import BeautifulSoup
import pandas as pd

class AnnouncementsData(object):
    '''
    获取info公告的数据
    '''
    COLUMNS = ['title', 'reporter', 'time', 'content', 'url']
    def __init__(self):
        self.root_url = "http://postinfo.tsinghua.edu.cn"
        self.enter_url_eduadmin = "/f/bangongtongzhi/more"
        self.enter_url_important = "/f/zhongyaogonggao/more"
        self.columns = ['title', 'reporter', 'time', 'content', 'url']
    
    def get_eduadmin_announcement_data(self, page_count:int=-1):
        """
        读取教务公告数据
        Parameter:
            page_count: int, 读取的页数 
        Return:
            pd.DataFrame
        """
        page = requests.get(self.root_url + self.enter_url_eduadmin)
        data_list = []
        count = 0
        while True:
            page_bs = BeautifulSoup(page.text, 'lxml')
            lis_page = page_bs.find_all(name='li')
            for li in lis_page:
                if li.find('em') is None:
                    continue
                one_notice_dict = {}
                a = li.find('a')
                ti = li.find('time')
                one_notice_dict['title'] = a.string
                if '[' not in a.string:
                    #题目中没有[的情况
                    one_notice_dict['reporter'] = li.text.split('[')[1].split(']')[0]
                else:
                    #题目中有[的情况
                    one_notice_dict['reporter'] = li.text.split('[')[1+len(re.findall('\[', a.string))].split(']')[0]
                one_notice_dict['time'] = int(datetime.datetime.strptime(ti.string, "%Y.%m.%d").timestamp())
                detail_url = a['href']
                if 'http://' not in detail_url and 'https://' not in detail_url:
                    detail_url = self.root_url + detail_url
                detail_page = requests.get(detail_url)
                detail_bs = BeautifulSoup(detail_page.text, 'lxml')
                one_notice_dict['content'] = '\n'.join(detail_bs.text.split())
                one_notice_dict['url'] = detail_url
                data_list.append(one_notice_dict)
            nextpage_node = page_bs.find(name="a", string=re.compile(".*>.*"))
            if nextpage_node is None or nextpage_node.get('href', None) is None:
                break
            nextpage_url = nextpage_node['href']
            nextpage_url = self.root_url + nextpage_url
            page = requests.get(nextpage_url)
            count += 1
            if page_count > 0 and count >= page_count:
                break
        return pd.DataFrame.from_records(data_list)

    def get_important_announcement_data(self):
        """
        读取重要公告数据，只有一页
        这个函数好像特别慢，显著慢于教务公告，可能是由于find_all取时间str的操作
        Parameter:
            
        Return:
            pd.DataFrame
        """
        page = requests.get(self.root_url + self.enter_url_important)
        data_list = []
        page_bs = BeautifulSoup(page.text, 'lxml')
        trs_page = page_bs.find_all(name='tr')
        for tr in trs_page:
            one_notice_dict = {}
            a = tr.find('a')
            one_notice_dict['title'] = a.string
            one_notice_dict['reporter'] = 'unknown'
            detail_url = a['href']
            if 'http://' not in detail_url and 'https://' not in detail_url:
                detail_url = self.root_url + detail_url
            detail_page = requests.get(detail_url)
            detail_bs = BeautifulSoup(detail_page.text, 'lxml')
            tis = re.findall("[0-9]*年[0-9]*月[0-9]*日", detail_bs.text)
            if len(tis) > 0:
                one_notice_dict['time'] = int(datetime.datetime.strptime(tis[-1].strip(), "%Y年%m月%d日").timestamp())
            else:
                one_notice_dict['time'] = -1
            one_notice_dict['content'] = '\n'.join(detail_bs.text.split())
            one_notice_dict['url'] = detail_url
            data_list.append(one_notice_dict)
        return pd.DataFrame.from_records(data_list)


if __name__ == "__main__":
    announcementsdata = AnnouncementsData()
    eduadmin = announcementsdata.get_eduadmin_announcement_data(2)
    print(eduadmin.head(10))
    important = announcementsdata.get_important_announcement_data()
    print(important.head(5))
