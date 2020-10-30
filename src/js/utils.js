const tp = require('tp-js-sdk');
const axios = require('axios');
axios.create({ headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
const BigNumber = require("bignumber.js");
let serverUrl = process.env.NODE_ENV == 'serve' ? '/serve' : process.env.VUE_APP_SERVE_URL;


/**
 * tp签名
 * @param {*} address 地址
 * @param {*} toAddress 转账地址
 * @param {*} coinType 币种类型
 * @param {*} coinIssuer 币种issuer
 * @param {*} candyAmount 转账数量
 */
export const signTransaction = async (address, coinType, coinIssuer, candyAmount, remark) => {
    try {
        let toAddress = process.env.VUE_APP_JINGCHUANG_ADDRESS;
        const nonce = await getNonce(address);
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
        });
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
    let random = Math.floor(Math.random() * 5);
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
 * @param {String} url 井通节点url
 * @param {String} address 钱包地址
 */
async function getNonce(address) {
    let random = Math.floor(Math.random() * 5);
    let data = {
        "method": "account_info",
        "params": [
            {
                "account": address
            }
        ]
    }
    let url = "/node" + random;
    let res = await axios.post(url, data);
    if (res.data.result.account_data) {
        return res.data.result.account_data.Sequence;
    }
}

// 查看交易状态
export const getTransactionStatus = async (hash) => {
    try {
        let random = Math.floor(Math.random() * 5);
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
    while (true) {
        let res = await getTransactionStatus(createHash);
        if (res) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    let data = {
        type: parseInt(candyType),
        num: parseInt(candyNumber),
        hash: createHash
    }
    let url = serverUrl + "/create";
    let res = await axios.post(url, data);
    return res.data;
}

// 抢红包
export const distributionCandy = async (address, id) => {
    let url = serverUrl + "/grab";
    let data = {
        address: address,
        id: id
    };
    let res = await axios.post(url, data);
    return res.data;
}

// 获取发出的红包列表
export const getSendCandyList = async (address) => {
    let url = serverUrl + "/getPacketByAddr?address=" + address;
    let res = await axios.get(url);
    return res.data;
}

// 获取已抢到的红包列表
export const getObtainCandyList = async (address) => {
    let url = serverUrl + "/getHistoryByAddr?address=" + address;
    let res = await axios.get(url);
    return res.data;
}

// 获取红包详情
export const getCandyDetail = async (id) => {
    let url = serverUrl + "/getPacketById?id=" + id;
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
    let unixTimestamp = new Date(unixtime);
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
        text = text.slice(0, 4) + "…" + text.slice(-4)
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
