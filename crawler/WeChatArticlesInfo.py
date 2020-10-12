import requests
import time
import pandas as pd

class WeChatArticlesInfo(object):
    """
    获取微信公众号的推文信息，包含url，可进一步获取content
    """
    COLUMNS = ['aid', 'title', 'cover_url', 'abstract', 'url', 'time']
    INFO_KEY = "app_msg_list"
    COUNT_KEY = "app_msg_cnt"
    def __init__(self, cookie:str, token:str):
        """
        Parameter:
            cookie: str
            token: str
        """
        self.sess = requests.session()
        self.search_url = "https://mp.weixin.qq.com/cgi-bin/searchbiz"
        self.appmsg_url = "https://mp.weixin.qq.com/cgi-bin/appmsg"
        self.headers = {
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36"
        }
        self.params = {
            "lang": "zh_CN",
            "f": "json",
            "token": token
        }
        self.fakeid = {}

    def get_basic_info(self, name:str, begin:int=0, count:int=5):
        """
        查找公众号基础信息，主要用于获取fakeid进行下一步的获取
        Parameter:
            name: str, 公众号名称，尽可能准确
            begin: int, 起始页数
            count: int, 数量，1-5

        Return:
            list
        """
        params = {
            "query": name,
            "count": str(count),
            "action": "search_biz",
            "ajax": "1",
            "begin": str(begin)
        }
        self.params.update(params)
        # 公众号名称一定要准确，否则排序上会出问题
        result = self.sess.get(self.search_url,
                                 headers=self.headers,
                                 params=self.params)
        return result.json()["list"]

    def __get_articles_info(self, name:str, begin:int, count:int=5):
        """
        获取公众号文章的信息，包含url(key: link)可用于后续爬取
        Parameters:
            name: str, 公众号名称，尽可能准确
            begin: int, 起始页数
            count: int, 数量，1-5
        Returns
            json
            important keys:
            "app_msg_list": 公众号文章信息
            "app_msg_cnt": 公众号文章总数
        """
        fakeid = self.fakeid.get(name, None)
        if fakeid is None:
            self.fakeid[name] = self.get_basic_info(name)[0]["fakeid"]
            fakeid = self.fakeid[name]
        params = {
            "fakeid": fakeid,
            "query": "",
            "begin": str(begin),
            "count": str(count),
            "type": "9",
            "action": "list_ex"
        }
        self.params.update(params)
        data = self.sess.get(self.appmsg_url, headers=self.headers, params=self.params)
        return data.json()
    
    def get_articles_info_step(self, name:str, begin:int=0, count:int=5):
        """
        查找并提取文章的信息
        Parameter:
            name: str, 公众号名称，尽可能准确
            begin: int, 起始页数
            count: int, 数量，1-5

        Return:
            list
        """
        data = self.__get_articles_info(name=name, begin=begin, count=count)[WeChatArticlesInfo.INFO_KEY]
        map_dict = {'aid': 'aid',
                    'title': 'title', 
                    'cover_url': 'cover',
                    'abstract': 'digest',
                    'url': 'link', 
                    'time': 'update_time'}
        data = [{key: x[map_dict[key]] for key in map_dict} for x in data]
        return data
    
    def get_articles_info(self, name:str, begin:int=0, count:int=15):
        """
        查找并提取文章的信息
        Parameter:
            name: str, 公众号名称，尽可能准确
            begin: int, 起始页数
            count: int, 数量
            endtimestamp: int，终止的timestamp

        Return:
            pd.DataFrame
        """
        step = 0
        data = []
        while 5 * step < count:
            data.extend(self.get_articles_info_step(name, 5*step, 5))
            step = step + 1
            #time.sleep(0.01)
        return pd.DataFrame.from_records(data)


if __name__ == "__main__":
    cookie = input("Please input cookie:\n")
    token = input("Pleanse input token:\n")
    print("\n")
    wcai = WeChatArticlesInfo(cookie=cookie.strip(), token=token.strip())
    result = wcai.get_articles_info("清华大学", begin=0, count=20)
    print(result.head(10))