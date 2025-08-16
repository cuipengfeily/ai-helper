import requests
import os


def get_picture(desps: list[str], test: bool = True):
    local_path = "D:/code/AI/pic"
    # use local picture for test
    ret = []
    count = 0
    if test:
        for desp in desps:
            ret.append(os.path.join(local_path, f"{count}.jpg"))
            count += 1
            if count >= 4:
                break
    else:
        pass
    return ret


    # url = "https://api.deepseek.com/v1/images/generations"
    # headers = {
    #     "Authorization": f"Bearer {os.getenv('DEEPSEEK_API_KEY')}"
    # }
    # data = {
    #     "prompt": desps,
    #     "n": 1,
    # }