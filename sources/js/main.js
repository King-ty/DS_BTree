/**
 * 根据B-树的阶数M生成一个随机数组用于生成B-树，且保证数组长度能够生成深度至少为3的B-树
 * @param {number} M B-树的阶数
 * @returns 生成的随机数组
 */
function getRandomBTNodes(M) {
    const length = 2 * M * (M - 1) + 1 // 计算数组长度
    let arr=[]
    for (let i = 0; i < length; ++i){
        let temp = Math.floor(Math.random() * length * 5)
        while (arr.findIndex((v)=>{return v===temp}) != -1) {
            temp = Math.floor(Math.random() * length * 5)
        }
        arr.push(temp)
    }
    return arr
}

/**
 * 初始化SVG缩放
 */
 function initSVGZoom() {
	const svgElement = document.getElementById('tree-canvas').childNodes[6];
	// console.log('svgElement',svgElement)
    svgPanZoom(svgElement, {controlIconsEnabled: true});
};

/**
 * 展示B-树的SVG图像
 * @param {number} value 本次操作的值
 */
function drawTree (value) {
    const vizData = bt.btToDOT(value); // 获得B-树的DOT文本
    // console.log('vizData=',vizData)
    const treeCanvas = document.getElementById('tree-canvas');
    treeCanvas.innerHTML = Viz(vizData, "svg");
    initSVGZoom();
};

/**
 * 展示中序遍历结果
 */
function traverseTree() {
    const textArea = document.getElementById('text-traverse');
    textArea.value = bt.btShow();
};

/**
 * 展示操作序列
 */
 function showInstrs() {
    const textArea = document.getElementById('text-operations');
     textArea.value = bt.log;
     textArea.scrollTop = textArea.scrollHeight;
};

/**
 * 展示树的图像和操作的内容
 * @param {number} value 本次操作的值
 */
function displayTree(value) {
    // 调用3个函数完成相应功能
    drawTree(value)
    traverseTree()
    showInstrs()
}

/**
 * 获得id所在标签的value值
 * @param {string} id 标签的id
 * @returns value值
 */
function getValue(id) {
    return document.getElementById(id).value;
}

/**
 * 获得操作输入文本框的value值
 * @returns 获得的value值
 */
function getOperand() {
    const operand = parseInt(getValue('input-operand'))
    console.log('operand=',operand)
    if (isNaN(operand)) {
        alert('不能操作空值！')
        throw ('操作数为空')
    }
    return operand
}

/**
 * 调整按钮的状态
 * @param {string} id 按钮的ID
 * @param {boolean} disable 按钮是否禁用
 */
function toggleButton(id,disable) {
    document.getElementById(id).disabled = disable;
};

/**
 * 解锁按钮
 */
function enableButtons() {
    toggleButton('btn-edit-search', false);
    toggleButton('btn-edit-add', false);
    toggleButton('btn-edit-del', false);
};

/**
 * 初始化B-树，可以选择生成随机的数组用于生成深度为3的B-树
 * @param {boolean} isRand 是否生成用于初始化的随机数组
 */
function btnBTInit(isRand) {
    const M = parseInt(getValue('input-m'));
    if (M < 3) {
        alert('M的值最小为3！')
        return
    }
    let arr = []
    // [56, 63, 21, 14, 34, 10, 60, 42, 48, 30, 57, 33, 29]//debug
    if (isRand) {
        arr=getRandomBTNodes(M)
    }
    bt = new btree.BTree(M, arr);
    // 初始化log
    if (isRand) {
        bt.log+='初始化随机B-树\t成功'
    } else {
        bt.log+='初始化空B-树\t成功'
    }
    displayTree();
    enableButtons(); // 解锁按钮
};

/**
 * 绑定查找按钮的相关函数
 */
function btnBTSearch() {
    const value=getOperand()
    bt.btSearchOut(value)
    displayTree(value)
};

/**
 * 绑定添加按钮的相关函数
 */
function btnBTInsert() {
    const value=getOperand()
    bt.btInsert(value,true);
    displayTree(value);
};

/**
 * 绑定删除按钮的相关函数
 */
function btnBTRemove() {
    const value=getOperand()
    bt.btDelete(value);
    displayTree();
};