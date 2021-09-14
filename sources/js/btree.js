(function (exports) {
	/**
	 * @class 计数器类
	 * @param {number} count 计数器的值
	 */
	class Counter {
		constructor() {
			this.count = 0;
		}

		add() {
			return this.count++;
		}
    }
    
	/**
     * @class B-树的结点类
	 * @param {BNode} parent 该节点的父节点对象
     * @param {Array} keys 该节点的关键字
     * @param {Array} children 该节点的所有子树
	 * @param {boolean} isLeaf 该节点是否为叶节点
     */
	 exports.BNode = class BNode{
		constructor(parent=null, keys=[], children=[],isLeaf=true) {
			this.parent = parent;
			this.keys = keys;
			this.children = children;
			this.isLeaf=isLeaf
		}
    };

    /**
     * @class B-树类
     * @param {number} M B-树的阶数
	 * @param {Array} valueArr 用于初始化树的数组
	*/
	exports.BTree=class BTree{
		constructor(M,valueArr=[]) {
			this.M = M; // B-树的阶数
			this.minKeyNum = Math.ceil(M / 2) - 1; // B-树节点的最小关键字数
			this.maxKeyNum = M - 1; // B-树节点的最大关键字数
			this.root = new btree.BNode(); // B-树的根节点
			this.log = '' // B-树的操作记录

			// 插入数组中的所有值
			valueArr.forEach((v) => {
				this.btInsert(v)
			})
		}

		/**
		 * 二分查找函数,用于查找树节点上关键字的位置
		 * @param {Array} arr 要查找的数组
		 * @param {number} value 要查找的值
		 * @returns 如果能找到,返回值在数组中的索引;如果找不到,设第一个大于该值的位置为l,返回-l-1
		 */
		halfSearch(arr = [], value) {
			let l = 0,
				r = arr.length,
				mid
			while (l < r) {
				mid = l + parseInt((r - l) / 2)
				if (value === arr[mid]) return mid
				else if (value < arr[mid])//最好用比较函数
					r = mid
				else l = mid + 1
			}
			return -l - 1 //返回负值，绝对值为第1个大于value的位置+1
		}

		/**
		 * 寻找当前子树中的最小值
		 * @param {BNode} bn 当前子树的根节点
		 * @returns 查找到的最小值所在的节点对象和该值
		 */
		minValue(bn) {
			while (!bn.isLeaf) {
				bn = bn.children[0]
			}
			return { bn, value: bn.keys[0] }
		}
	
		/**
		 * 寻找当前子树中的最大值
		 * @param {BNode} bn 当前子树的根节点对象
		 * @returns 查找到的最大值所在的节点对象和该值
		 */
		maxValue(bn) {
			while (!bn.isLeaf) {
				bn = bn.children[bn.children.length - 1]
			}
			return { bn, value: bn.keys[bn.keys.length - 1] }
		}

		/**
		 * 查找函数的递归部分
		 * @param {BNode} bn 当前节点对象
		 * @param {*} value 要查找的值
		 * @returns 最后查找到的节点对象和查找到的位置
		 */
		btSearch_rec(bn, value) {
			const index = this.halfSearch(bn.keys, value)
			if (index >= 0 || bn.isLeaf) {
				return { bn, index }
			} else return this.btSearch_rec(bn.children[-index - 1], value)
		}
	
		/**
		 * 查找函数
		 * @param {number} value 要查找的值
		 * @returns 最后查找到的节点对象和查找到的位置
		 */
		btSearch(value) {
			// 如果是空树则一定查找失败
			if (this.root.keys.length === 0) {
				return { bn: null, index: -1 }
			}
			return this.btSearch_rec(this.root, value)
		}

		/**
		 * 用于交互的查找函数
		 * @param {number} value 要查找的值
		 * @returns 是否可以找到!!!!!!!!!!!!!!!!!!!!!!!!!!
		 */
		btSearchOut(value) {
			const FOUND=1,INSERTED=2,NOTFOUND=0
			const ret = this.btSearch(value)
			if (ret.index >= 0) {
				this.log += '\n\n查找' + value + '\t成功';
				alert(value + "可以找到")
				return FOUND
			} else {
				// 找不到则询问是否添加
				this.log += '\n\n查找' + value + '\t失败';
				if (confirm(value + "不在树上，是否添加？")) {
					this._btInsert(ret.bn, -ret.index - 1, value)
					this.log+='\t插入成功'
					console.log(value, "插入成功")
					return INSERTED
				}
				return NOTFOUND
			}
		}

		/**
		 * 节点分裂函数
		 * @param {BNode} bn 要分裂的节点
		 */
		btSplit(bn) {
			// 初始化分裂出的新节点
			let newNode = new btree.BNode(
				bn.parent,
				bn.keys.slice(this.minKeyNum + 1),
				bn.children.length !== 0 ? bn.children.slice(this.minKeyNum + 1) : [],
				bn.isLeaf
			)
			// 更新原节点部分子节点的父节点指向为新节点
			for (let i = this.minKeyNum + 1; i < bn.children.length; ++i){
				bn.children[i].parent=newNode
			}
			if (bn === this.root) {
				// 如果分裂的是根节点，则需要建立新的根节点
				let newRoot = new btree.BNode(
					null,
					[bn.keys[this.minKeyNum]],
					[bn, newNode],
					false
				)
				bn.parent = newRoot
				newNode.parent = newRoot
				this.root = newRoot
			} else {
				// 如果分裂的不是根节点，则将中间值向父节点继续执行插入过程
				this._btInsert(
					bn.parent,
					-this.halfSearch(bn.parent.keys, bn.keys[this.minKeyNum]) - 1,
					bn.keys[this.minKeyNum],
					newNode
				)
			}
			bn.keys = bn.keys.slice(0, this.minKeyNum)
			bn.children = bn.children.slice(0, this.minKeyNum + 1)
		}

		/**
		 * 将值插入指定位置
		 * @param {BNode} bn 要被插入的节点对象
		 * @param {number} index 被插入的位置
		 * @param {number} value 被插入的关键字
		 * @param {BNode} newChild 插入时需要一起插入的新子节点，可能为空
		 */
		_btInsert(bn, index, value, newChild) {
			// console.log("insert", bn.keys, index, value)
			// 插入新的关键字
			bn.keys.splice(index, 0, value)
			if (typeof newChild !== "undefined") {
				// console.log("newChild=", newChild)
				// 插入新节点
				bn.children.splice(index + 1, 0, newChild)
			}
			// 如果插入后的节点不符合要求，则需要进行分裂
			if (bn.keys.length > this.maxKeyNum) {
				this.btSplit(bn)
			}
		}

		/**
		 * 向B-树中插入一个关键字
		 * @param {number} value 要插入的关键字
		 * @param {boolean} isShow 是否需要提示，当使用“添加”按钮调用时需要提示
		 */
		btInsert(value, isShow) {
			// 如果B-树为空，则直接插入
			if (this.root.keys.length === 0) {
				this.root.keys.push(value)
				console.log(value, "插入成功")
				if (isShow) {
					this.log+='\n\n插入'+value+'\t成功'
					alert(value + "插入成功")
				}
				return
			}
			const ret = this.btSearch(value) // 查找要插入的位置
			if (ret.index >= 0) {
				// 如果关键字已存在，则无需插入
				console.log("元素" + value + "已存在，无需插入")
				if (isShow) {
					this.log+='\n\n插入'+value+'\t失败：关键字已存在'
					alert("元素" + value + "已存在，无需插入")
				}
			} else {
				// 找不到关键字，则插入
				this._btInsert(ret.bn, -ret.index - 1, value)
				console.log(value, "插入成功")
				if (isShow) {
					this.log+='\n\n插入'+value+'\t成功'
					alert(value + "插入成功")
				}
			}
		}

		/**
		 * 合并节点函数
		 * @param {BNode} bn 要合并的节点的父节点对象
		 * @param {number} index 要合并的节点的索引位置
		 */
		btMerge(bn, index) {
			// console.log("btMerge", "bn,index=", bn.keys, index)
			bn.children[index].keys = bn.children[index].keys
				.concat(bn.keys[index])
				.concat(bn.children[index + 1].keys)
			if (!bn.children[index].isLeaf) {
				// 如果要合并的节点不是叶节点，则需要调整合并节点及其子节点的父子关系
				bn.children[index].children = bn.children[index].children.concat(
					bn.children[index + 1].children
				)
				for (let i = 0; i < bn.children[index + 1].children.length; ++i){
					bn.children[index + 1].children[i].parent=bn.children[index]
				}
			}
			const tempValue = bn.keys[index]
			// 将父节点的相应关键字和子节点删除
			bn.keys.splice(index, 1)
			bn.children.splice(index + 1, 1)
			if (bn === this.root) {
				// 处理根节点
				// 如果合并后根节点空了，则根节点变为目前唯一的子节点
				if (bn.keys.length === 0) {
					this.root = bn.children[0]
				}
			} else if (bn.keys.length < this.minKeyNum) {
				// 如果合并后父节点也过小，则需要进一步调整父节点
				this.btAdjust(bn, tempValue)
			}
		}
	
		/**
		 * 调整节点及其兄弟节点的关键字情况
		 * @param {BNode} bn 要调整节点的父节点对象
		 * @param {number} index1 要调整的节点
		 * @param {number} index2 与要调整节点相邻的兄弟节点
		 */
		_btAdjust(bn, index1, index2) {
			if (bn.children[index2].keys.length > this.minKeyNum) {
				// 如果兄弟节点的关键字数比最小数目大，直接从兄弟节点借关键字
				if (index1 < index2) {
					// 兄弟节点为右节点
					bn.children[index1].keys.push(bn.keys[index1])
					bn.keys.splice(index1, 1, bn.children[index2].keys[0])
					bn.children[index2].keys.shift()
					//   这里应该考虑儿子的归属
					if (!bn.children[index1].isLeaf) {
						bn.children[index1].children.push(bn.children[index2].children[0])
						bn.children[index2].children.shift()
					}
				} else {
					// 兄弟节点为左节点
					bn.children[index1].keys.unshift(bn.keys[index2])
					bn.keys.splice(
						index2,
						1,
						bn.children[index2].keys[bn.children[index2].keys.length - 1]
					)
					bn.children[index2].keys.pop()
					if (!bn.children[index1].isLeaf) {
							bn.children[index1].children.unshift(
							bn.children[index2].children[bn.children[index2].children.length - 1]
						)
						bn.children[index2].children.pop()
					}
				}
			} else {
				// 若兄弟节点不能借关键字，则合并两节点
				this.btMerge(bn, Math.min(index1, index2))
			}
		}
	
		/**
		 * delete关键字后为使B-树保持合理形态进行的调整函数
		 * @param {BNode} bn 要调整的节点对象
		 * @param {number} value 调整是因为delete函数的调用，此处value为删除的关键字
		 */
		btAdjust(bn, value) {
			// 注意Adjust不只用来调整叶节点吗，这是我一开始一直没处理好的bug...
			// console.log("btAdjust", "bn,value=", bn.keys, value)
			if (typeof value === "undefined") value = bn.keys[0]
			// 找到要调整的点在其父节点的关键字中的索引位置
			const temp = this.halfSearch(bn.parent.keys, value)
			const index = temp < 0 ? -temp - 1 : temp + 1
			// console.log("btAdjust", "index=", index)
			if (index === 0) {
				// 该节点是其父节点的第一个子节点
				this._btAdjust(bn.parent, index, index + 1)
			} else if (index === bn.parent.keys.length) {
				// 该节点是其父节点的最后一个子节点
				this._btAdjust(bn.parent, index, index - 1)
			} else {
				// 该节点是其父节点的中间子节点
				if (bn.parent.children[index - 1].keys.length > this.minKeyNum) {
					// 前一个兄弟节点可以借关键字的情况
					this._btAdjust(bn.parent, index, index - 1)
				} else {
					this._btAdjust(bn.parent, index, index + 1)
				}
			}
		}
	
		/**
		 * 删除函数的具体实现
		 * @param {BNode} bn 要删除的值所在节点对象
		 * @param {number} index 删除位置的索引位置
		 * @param {number} value 要删除的关键字
		 */
		_btDelete(bn, index, value) {
			// console.log("_btDelete", "bn,index,value=", bn.keys, index, value)
			if (bn.isLeaf) {
				// 如果关键字在叶节点，则直接删除
				// 数组中移除该关键字
				bn.keys.splice(index, 1)
				// 考虑树根！树根关键字数目没有最低的限制
				if (bn != this.root && bn.keys.length < this.minKeyNum) {
					// console.log("_btDelete,isLeaf", "bn=", bn.keys)
					this.btAdjust(bn, value)
				}
			} else {
				// 如果关键字不在叶节点，则将关键字替换为大于该关键字的第一个关键字a，并删除关键字a
				const ret = this.minValue(bn.children[index + 1])
				bn.keys.splice(index, 1, ret.value)
				this._btDelete(ret.bn, 0, ret.value)
			}
		}
	
		/**
		 * 删除函数
		 * @param {number} value 要删除的值
		 */
		btDelete(value) {
			const ret = this.btSearch(value)
			if (ret.index < 0) {
				// value不在树上
				this.log+='\n\n删除'+value+'\t失败：关键字不存在'
				console.log(value + "不存在，无法删除")
				alert(value + "不存在，无法删除")
			}
			else {
				// value在树上
				this._btDelete(ret.bn, ret.index, value)
				this.log+='\n\n删除'+value+'\t成功'
				console.log(value, "删除成功")
				alert(value + "删除成功")
			}
		}

		/**
		 * 中序遍历B-树
		 * @param {BNode} bn 当前遍历到的节点对象
		 * @returns 中序遍历的结果字符串
		 */
		btTraverse(bn) {
			if (bn.isLeaf) return bn.keys
			let ret = [],
				i
			for (i = 0; i < bn.children.length - 1; ++i) {
				ret = ret.concat(this.btTraverse(bn.children[i]))
				ret.push(bn.keys[i])
			}
			return ret.concat(this.btTraverse(bn.children[i]))
		}

		/**
		 * 包装btTraverse，用于调试输出
		 * @returns 中序遍历的结果字符串
		 */
		btShow() {
			console.log(this.root)
			const ret=this.btTraverse(this.root)
			console.log(ret)
			return ret
		}

		/**
		 * B-树转为DOT格式的中间遍历函数
		 * @param {BNode} bn 当前节点对象
		 * @param {number} value 调用该函数时操作的值，用于标红
		 * @param {Counter} no 计数器，用于唯一标识节点
		 * @returns 该节点在DOT中的节点名称和该子树转出的DOT格式字符串
		 */
		_btToDOT(bn, value, no = new Counter) {
			// 本质就是按照DOT格式拼接字符串
			const nodeid = 'node' + no.add()
			let str=nodeid + '['+(bn.keys.findIndex(v=>{return v===value})!==-1 ? 'color="red",':'')+'label = \"'
			for (let i = 0; i < bn.keys.length; ++i){
				str += "<f" + i + "> | " + bn.keys[i] + " | "
			}
			str += "<f" + bn.keys.length + "> \"];\n"
			for (let i = 0; i < bn.children.length; ++i){
				const ret = this._btToDOT(bn.children[i],value, no)
				str += "\"" + nodeid + "\":f" + i + " -> \"" + ret.nodeid + "\";\n"
				str+=ret.str
			}
			return { nodeid, str }
		}

		/**
		 * 将B-树转为DOT格式用于显示图片
		 * @param {number} value 调用该函数时操作的值，用于标红
		 * @returns 生成的DOT格式字符串
		 */
		btToDOT(value) {
			return 'digraph g {\nsplines="line";\nnode [shape = record, height = .1];\n'+this._btToDOT(this.root,value).str+'}\n'
		}
	}
    
})(typeof exports === 'undefined'? this.btree={}: exports);
    