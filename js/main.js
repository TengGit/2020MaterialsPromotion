(function(_, d, q, t){
	'use strict';
	var startSpace = 2000;
	var animateSpace = 600;
	var w = 640, h = 1136, aspectRatio = w / h;
	
	var tree = [ 4,0, // root
		[ 6,0, // 向上
			[ 5,0, // 小路
				[ 7,0, // 绿色
					[ 9,0,1,"33" ],// 黄色
					[ 9,0,3,"34" ] // 蓝色
				],
				[ 9,0,6,"24" ] // 无视
			],
			[ 11,0, // 主路
				[ 6,0, // 休息
					[ 2,0, // 等待
						[ 4,0,4,"42" ],// 月亮
						[ 6,0,5,"43" ] // 繁星
					],
					[ 10,0,1,"35" ] // 入睡
				],
				[ 8,0,2,"25" ] // 继续
			]
		],
		[ 6,0, // 向下
			[ 10,0, // 问路
				[ 11,0,7,"26" ],// 集市
				[ 11,0,5,"27" ] // 车站
			],
			[ 6,0, // 探索
				[ 8,0, // 海滩
					[ 7,0, // 浅水
						[ 4,0,4,"42" ],// 月亮
						[ 6,0,5,"43" ] // 繁星
					],
					[ 7,0,6,"36" ] // 石头
				],
				[ 6,0,3,"28" ] // 河流
			]
		]
	];
	
	var ED_NUM = 7;
	var BG_NUM = 5;
	var BUTTON_X1 = 91;
	var BUTTON_X2 = 325;
	var BUTTON_Y = 810;
	
	var IMG_URL = "img/{0}.png";

	function $(sel) {
		return d.querySelector(sel);
	}
	
	function r(str) {
		return q.getResult(str);
	}
	
	function remove(element) {
		element.parentNode.removeChild(element);
	}
	
	function subst(str) {
		for (var i = 1; i < arguments.length; i++) {
			str = str.replace(new RegExp('\\{' + (i - 1).toString() + '\\}', 'g'), arguments[i]);
		}
		return str;
	}
	
	function adjustPosition() {
		var root = $("#root");
		var sw = document.body.clientWidth, sh = document.body.clientHeight, w = sw, h = sh;
		if (w / h < aspectRatio) {
			h = w / aspectRatio;
		} else {
			w = h * aspectRatio;
		}
		root.style.width = w + "px";
		root.style.height = h + "px";
		root.style.top = (sh - h) / 2 + "px";
		root.style.left = (sw - w) / 2 + "px";
	}
	
	function imageResource(id, requireImgElement = false) {
		var result = {src: subst(IMG_URL, id), id: id, type: t.IMAGE};
		if (requireImgElement) result.preferXHR = false;
		return result;
	}
	
	var res = [];
	
	for (var i = 1; i <= ED_NUM; i++) {
		res.push({src: subst("img/e{0}.jpg", i), id: "e" + i.toString(), type: t.IMAGE, preferXHR: false});
	}
	for (var i = 1; i <= BG_NUM; i++) {
		res.push(imageResource("bg" + i.toString()));
	}
	
	function buildBookAndRes(book, res, tree, depth, page, btn) {
		var result;
		
		if (typeof tree[2] === "number") {
			--depth;
			result = [[Story.bg, "bg" + depth.toString()]];
			
			for (var i = 0; i < tree[0]; i++) {
				if (tree[1] == i) {
					var id = tree[3] + tree[0].toString().padStart(2, "0");
					res.push(imageResource(id));
					result.push([Story.img, id, 0, 0]);
				}
				var id = tree[3] + i.toString().padStart(2, "0");
				res.push(imageResource(id));
				result.push([Story.img, id, 0, 0]);
			}
			if (tree[1] == tree[0]) {
				var id = tree[3] + tree[0].toString().padStart(2, "0");
				res.push(imageResource(id));
				result.push([Story.img, id, 0, 0]);
			}
			
			result.push([Story.pause]);
			result.push([Story.jmp, tree[2]]);
		} else {
			result = [[Story.bg, "bg" + (depth + 1).toString()]];
			
			if (page.length <= depth) page.push(0);
			if (btn.length <= depth) btn.push(0);
			var depthSeq = page[depth]++;
			
			for (var i = 0; i < tree[0]; i++) {
				if (tree[1] == i) {
					var id = depth.toString() + depthSeq.toString() + tree[0].toString().padStart(2, "0");
					res.push(imageResource(id));
					result.push([Story.img, id, 0, 0]);
				}
				var id = depth.toString() + depthSeq.toString() + i.toString().padStart(2, "0");
				res.push(imageResource(id));
				result.push([Story.img, id, 0, 0]);
			}
			if (tree[1] == tree[0]) {
				var id = depth.toString() + depthSeq.toString() + tree[0].toString().padStart(2, "0");
				res.push(imageResource(id));
				result.push([Story.img, id, 0, 0]);
			}
			var btnSeq = btn[depth], id1 = "b" + depth.toString() + btnSeq.toString(), id2 = "b" + depth.toString() + (btnSeq + 1).toString();
			btn[depth] += 2;
			res.push(imageResource(id1));
			res.push(imageResource(id2));
			result.push([
				Story.choice,
				[id1, BUTTON_X1, BUTTON_Y, buildBookAndRes(book, res, tree[2], depth + 1, page, btn)],
				[id2, BUTTON_X2, BUTTON_Y, buildBookAndRes(book, res, tree[3], depth + 1, page, btn)]
			]);
		}
		
		book.push(result);
		return book.length - 1;
	}
	var book = [[[Story.jmp, ED_NUM + 1]]];
	for (var i = 0; i < ED_NUM; i++) {
		book.push([[Story.clbg], [Story.ed, "e" + (i + 1).toString()]]);
	}
	book[0][0][1] = buildBookAndRes(book, res, tree, 0, [], []);

	_.addEventListener("load", function () {
		adjustPosition();
		
		q.on("progress", function (e) {
			var percent = Math.floor(e.progress * 100) + "%"
			$("#percent").textContent = percent;
			$("#progress-bar").style.width = percent;
		});
		
		q.on("complete", function () {
			$("#percent").textContent = "Loaded!";
			$("#progress-bar").style.width = "100%";
			
			var start = $("#start");
			start.style.visibility = "visible";
			var startTip = $("#click-to-start");
			startTip.style.visibility = "visible";
			
			fadeIn(startTip, startSpace).setData(start).then(function(o) {
				o.data.onclick = function () {
					this.onclick = null;
					fadeOutAndDelete($("#progress-container"), startSpace);
					fadeOutAndDelete(this, startSpace).then(function() {
						new Story(book, w, h, {trans: fadeIn, transArg: [animateSpace]}).start($("#root"));
					});
				};
			});
			
		});
		
		q.loadManifest(res);
	});
	
	_.addEventListener("resize", adjustPosition);
	
	_.resource = q;
})(window, document, new createjs.LoadQueue(), createjs.Types);