const tp = require('tp-js-sdk');
const axios = require('axios');
axios.create({ headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
const serverUrl = "/api";
const hongbao = "🧧"
const prefix = "复制口令：" + hongbao + " ";
const suffix = " 👉【TP】抢红包啦！"

/**
 * tp签名
 * @param {*} address 地址
 * @param {*} toAddress 转账地址
 * @param {*} coinType 币种类型
 * @param {*} coinIssuer 币种issuer
 * @param {*} candyAmount 转账数量
 * @param {*} nonce 交易序列
 */
export const signTransaction = async (address, coinType, coinIssuer, candyAmount, nonce, remark) => {
    try {
        let toAddress = process.env.VUE_APP_JINGCHUANG_ADDRESS;
        let amount;
        if (coinType == "SWTC") {
            amount = candyAmount;
        } else {
            amount = {
                "currency": coinType,
                "issuer": coinIssuer,
                "value": candyAmount
            }
        }
        let res = await tp.signJingtumTransaction({
            "Account": address,
            "Destination": toAddress,
            "Fee": 0.001,
            "Amount": amount,
            "TransactionType": "Payment",
            "Sequence": nonce,
            "Memos": [
                {
                    "Memo": {
                        "MemoData": remark
                    }
                }
            ]
        }).catch(e => console.log(e));
        return { result: res.result, data: res.data };
    } catch (error) {
        console.log(error)
        return { result: false };
    }
}

/**
 * 发送原始交易
 * @param {String} sign 签名内容
 */
export const sendRawTransaction = async (sign) => {
    let random = Math.floor(Math.random() * 2);
    let data = {
        "method": "submit",
        "params": [
            {
                "tx_blob": sign
            }
        ]
    }
    let url = "/node" + random;
    let res = await axios.post(url, data);
    if (res.data.result.engine_result == "tesSUCCESS") {
        return { result: true, txHash: res.data.result.tx_json.hash };
    }
    return { result: false };
}

/**
 * 获取地址nonce
 * @param {String} address 钱包地址
 */
export async function getNonce(address) {
    let url = serverUrl + "/getNonce?address="+address;
    let res = await axios.get(url);
    return res.data;
}

// 查看交易状态
export const getTransactionStatus = async (hash) => {
    try {
        let random = Math.floor(Math.random() * 2);
        let data = {
            "method": "tx",
            "params": [
                {
                    "transaction": hash,
                    "binary": false
                }
            ]
        };
        let url = "/node" + random;
        let res = await axios.post(url, data);
        if (res.data.result.meta) {
            let status = res.data.result.meta.TransactionResult;
            console.log("获取交易状态", res.data.result.meta.TransactionResult)
            if (status == "tesSUCCESS") {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.log("查看交易详情Error", error)
        return false;
    }
}

export const isTransferError = async (hash) => {
    try {
        let random = Math.floor(Math.random() * 2);
        let data = {
            "method": "tx",
            "params": [
                {
                    "transaction": hash,
                    "binary": false
                }
            ]
        };
        let url = "/node" + random;
        let res = await axios.post(url, data);
        if (res.data.result.meta) {
            let status = res.data.result.meta.TransactionResult;
            if (status != "tesSUCCESS") {
                return true;
            } else {
                return false;
            }
        }
    } catch (error) {
        return false;
    }
}

/**
 * 获取钱包余额
 * @param {String} address 
 */
export const getAddressBalance = async (address) => {
    let url = "/scan/wallet/balance/ " + new Date().getTime() + "?w=" + address;
    let res = await axios.get(url);
    return res.data;
}

/**
 * 创建红包
 * @param candyType 红包类型
 * @param coinType 币种类型
 * @param coinIssuer 币种issuer
 * @param candyAmount 红包金额
 * @param candyNumber 红包份额
 * @param creatorAddress 创建者地址
 * @param createHash 转账hash
 * @param candyRemark 转账备注
 */
export const createCandy = async (candyType, candyNumber, createHash) => {
    // 判断hash是否上链
    var i = 20;
    while (i > 0) {
        let res = await getTransactionStatus(createHash);
        if (res) {
            break;
        }
        i--;
        await new Promise(resolve => setTimeout(resolve, 500))
    }
    if (i == 0) return { status: 404, msg: '转账失败，请重试' }
    let data = {
        type: parseInt(candyType),
        num: parseInt(candyNumber),
        hash: createHash
    }
    let url = serverUrl + "/create";
    let res = await axios.post(url, data);
    return res.data;
}

export const sendRawTransactionAndCreate = async (candyType, candyNumber, sign) => {
    let data = {
        type: parseInt(candyType),
        num: parseInt(candyNumber),
        sign: sign
    }
    let url = serverUrl + "/sendTransactionAndCreate";
    let res = await axios.post(url, data);
    return res.data;
}

// 抢红包
export const distributionCandy = async (address, id, title) => {
    let url = serverUrl + "/grab";
    let data = {
        address: address,
        id: id,
        title: title,
    };
    let res = await axios.post(url, data);
    return res.data;
}

// 获取服务共发出的红包数量
export const getPacketCount = async () => {
    let url = serverUrl + "/getPacketCount";
    let res = await axios.get(url);
    return res.data;
}

// 红包申诉
export const makeUpCandy = async (id) => {
    let url = serverUrl + "/makeUp";
    let res = await axios.post(url, { id: id });
    return res.data;
}

// 获取发出的红包列表
export const getSendCandyList = async (address, year, pageNum) => {
    let url = serverUrl + "/getPacketByAddr?address=" + address + "&year=" + year + "&pageNum=" + pageNum;
    let res = await axios.get(url);
    return res.data;
}

// 获取已抢到的红包列表
export const getObtainCandyList = async (address, year, pageNum) => {
    let url = serverUrl + "/getHistoryByAddr?address=" + address + "&year=" + year + "&pageNum=" + pageNum;
    let res = await axios.get(url);
    return res.data;
}

// 获取红包详情
export const getCandyDetail = async (id, pageNum) => {
    let url = serverUrl + "/getPacketById?id=" + id + "&pageNum=" + pageNum;
    let res = await axios.get(url);
    return res.data;
}

// 根据地址获取发送红包数量
export const sendPacketAmount = async (address, year) => {
    let url = serverUrl + "/sendPacketAmount?address=" + address + "&year=" + year;
    let res = await axios.get(url);
    return res.data;
}

// 根据地址获取领取红包数量
export const getPacketAmount = async (address, year) => {
    let url = serverUrl + "/getPacketAmount?address=" + address + "&year=" + year;
    let res = await axios.get(url);
    return res.data;
}

// 获取随机井通节点
async function getJingtumNode() {
    let url = "/jingtum/rpcservice?t=" + new Date().getTime();
    let res = await axios.get(url);
    if (res.data) {
        let list = res.data.rpcpeers;
        let random = Math.floor(Math.random() * list.length);
        return list[random];
    }
}

/**
 * 格式化时间戳
 * @param  unixtime 1603959642445
 */
export const formatTime = (unixtime) => {
    let unixTimestamp = new Date(unixtime.replace(/-/g, '/'));
    let Y = unixTimestamp.getFullYear();
    let M =
        unixTimestamp.getMonth() + 1 >= 10
            ? unixTimestamp.getMonth() + 1
            : '0' + (unixTimestamp.getMonth() + 1);
    let D =
        unixTimestamp.getDate() >= 10
            ? unixTimestamp.getDate()
            : '0' + unixTimestamp.getDate();
    let H = unixTimestamp.getHours() >= 10 ? unixTimestamp.getHours() : "0" + unixTimestamp.getHours();
    let mm = unixTimestamp.getMinutes();
    let ss = unixTimestamp.getSeconds();
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (ss < 10) {
        ss = '0' + ss;
    }
    let toDay = M + '-' + D + ' ' + H + ':' + mm;
    return toDay;
};

// 文字溢出处理
export const formatTextOverflow = (text) => {
    if (text.length > 8) {
        text = text.slice(0, 4) + "…";
    }
    return text;
}

// 井通备注转换
function convertStringToHex(in_str) {
    const str = unescape(encodeURIComponent(in_str));
    let out_str = "";
    let i;
    for (i = 0; i < str.length; i++) {
        out_str += (" 00" + Number(str.charCodeAt(i)).toString(16)).substr(-2);
    }
    return out_str.toUpperCase();
}
// 口令解密
export const decodePwd = (password) => {
    // 头部
    var prefixIndex = password.indexOf(prefix);
    // 尾部
    var suffixIndex = password.indexOf(suffix);
    password = password.slice(prefixIndex, suffixIndex)

    return password.replace(suffix, '').replace(prefix, '').replace(new RegExp(hongbao, 'g'), '-').trim();
}

// 口令加密
export const encodePwd = (password) => {
    return (prefix + password + suffix).replace(new RegExp('-', 'g'), hongbao);
}

// 口令标题解密
export const decodeTitlePwd = (password) => {
    password = password.replace("【", "").replace("】", "");
    // 头部
    var prefixIndex = password.indexOf(prefix);
    // 尾部
    var suffixIndex = password.indexOf(suffix);
    let result = {};
    result.title = password.slice(0, prefixIndex);
    password = password.slice(prefixIndex, suffixIndex)
    result.password = password.replace(suffix, '').replace(prefix, '').replace(new RegExp(hongbao, 'g'), '-').trim()
    return result;
}

// 口令标题加密
export const encodePwdTitle = (password, title) => {
    return ("【" + title + "】" + prefix + password + suffix).replace(new RegExp('-', 'g'), hongbao);
}
// 格式化金额
export const formatBalance = (num) => {
    let data = num.toString();
    let index = data.toString().indexOf(".");
    if (index > 0) {
        return data.slice(0, index + 3);
    }
    return data;
}
// 获取当前口令标题
export const getPasswordTitle = async (address) => {
    let url = serverUrl + "/getPasswordTitle?address=" + address;
    let res = await axios.get(url);
    return res.data;
}

// 设置口令标题

export const setPasswordTitle = async (address, sign, title) => {
    let data = {
        address,
        sign,
        title
    }
    let url = serverUrl + "/setPasswordTitle";
    let res = await axios.post(url, data);
    return res.data;
}