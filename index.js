// -----------------   画图构造函数  -------------------
function Draw(ctx, settings){
	this.ctx = ctx; // 2d上下文对象
	this.fill_style=settings.fill_style;  // 描边或填充
    this.color=settings.color; // 颜色
    this.line_width=settings.line_width; // 线宽  
}
// 定义 Draw 的 原型方法 --------根据属性和坐标作图----------------
// 直线
// 矩形
// 圆圈
// 多边形
// 铅笔
// 橡皮
Draw.prototype = {
	init: function() {
		this.ctx.strokeStyle=this.color;
	    this.ctx.fillStyle=this.color;
	    this.ctx.lineWidth=this.line_width;		
	},
	line: function(x, y, x1, y1){
		this.init();
		this.ctx.beginPath(); // 新建一条path
		this.ctx.moveTo(x, y); // 把笔移动到制定位置
		this.ctx.lineTo(x1, y1); // 绘制
		this.ctx.closePath(); // 闭合路径
		this.ctx.stroke(); // 绘制路径   直线没有fill()方法
	},
	rect: function(x, y, x1, y1){
		this.init();
		if (this.fill_style == "stroke"){
			this.ctx.strokeRect(x, y, x1-x, y1-y);
		} else if (this.fill_style == "fill"){
			this.ctx.fillRect(x, y, x1-x, y1-y);
		}
	},
	circular: function(x, y, x1, y1){
		this.init();
		let r=Math.sqrt(Math.pow(x-x1, 2) + Math.pow(y-y1, 2));
		this.ctx.beginPath();
		this.ctx.arc(x, y, r, 0, 2*Math.PI);
		if (this.fill_style == "stroke"){
			this.ctx.stroke();
		} else if (this.fill_style == "fill"){
			this.ctx.fill();
		}
	},
	poly: function(x, y, x1, y1, n){
		this.init();
		let r = Math.sqrt(Math.pow(x-x1, 2) + Math.pow(y-y1, 2));
		let nx = r*Math.cos(Math.PI/n), ny = r*Math.sin(Math.PI/n);

		this.ctx.save(); // Canvas状态存储在栈中，每当save()方法被调用后，当前的状态就被推送到栈中保存。
		this.ctx.translate(x, y); // 以起始点作为原点       save()
		this.ctx.rotate(Math.PI/2); // 坐标轴顺时针旋转90°

		this.ctx.beginPath();
        this.ctx.moveTo(nx, ny);
        for(var i=0; i<=n; i++){ // 通过旋转坐标轴以及轴对称的方式来生成多边形的每条边
            this.ctx.rotate(Math.PI*2/n);
            this.ctx.lineTo(nx, -ny);
        }
        if(this.fill_style == "stroke"){
            this.ctx.stroke();
        } else if (this.fill_style == "fill"){
            this.ctx.fill();
        }
        this.ctx.restore(); // 每一次调用 restore 方法，上一个保存的状态就从栈中弹出，所有设定都恢复(类似数组的 pop())
	},
	pen: function(x1, y1){
        this.init();
        this.ctx.lineCap = "round";
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
	},
	eraser: function(x1, y1){
        this.ctx.lineCap = "round";
        this.ctx.clearRect(x1-5, y1-5, this.line_width, this.line_width);
	}
};


// ---------------------------------------------------------------------

$(document).ready(function(){
	let container = $(".container");
/*	let canvas0 = document.getElementById("myCanvas"); // javascript  事件使用canvas.onmousedown = function(e){}
	if (!canvas0.getContext) return;
	let ctx0 = canvas0.getContext("2d");  // getContext是DOM对象方法，也就是js原生方法，不能用jquery对象直接调用
*/
	let canvas = $("#myCanvas"); // jquery 事件使用 canvas.mousedown(function(e){})
	let ctx = canvas[0].getContext("2d");

//   ----------------    获取属性         -------------------------
// 获取画笔类型（以及多边形的边数），是填充还是描边，颜色，线宽

// 获取画笔类型type
let type_ul = $(".type li");
let type = "pen"; 
type_ul.each(function(index, el){
	$(el).click(function(){
		// 修改active状态
		type_ul.removeClass("active");
		$(this).toggleClass("active");
		// 获取类型设置
		type = $(this).attr("data");

		// 铅笔，直线，橡皮没有填充类型，在点击目标是这三种情况时，将fill改为stroke
		if (type=="pen"||type=="line"||type=="eraser"){ 
			if ($(".fill_style .fill").hasClass("active")){
				$(".fill_style .fill").removeClass("active");
				$(".fill_style .stroke").addClass("active");
				fill_style = "stroke";
			}
		} 	
	})
})

// 获取多边形的边数
let poly_n = 3; 
$(".poly input").change(function(index, el){ 
	poly_n = $(this).val(); // 或者用javascript的this.value;
})

// 多边形边数设置的显隐
$(".poly").hover(function(){  
	$(".poly input").toggle();
})

// 获取描边或填充
let fill_style_ul = $(".fill_style li");
let fill_style = "stroke";
fill_style_ul.each((index, el)=>{
	$(el).click(()=>{
		// 铅笔，直线，橡皮没有填充类型，在处于这三种情况时，不允许改变fill_style(保持为stroke)
		if ($(el).hasClass("fill") && type=="pen"||type=="line"||type=="eraser"){ 
			// $(".fill_style .fill").attr("disabled", true);
		} else {
			// 修改active状态
			fill_style_ul.removeClass("active");
			$(el).toggleClass("active"); // 箭头函数没有this
			// 获取描边或填充设置
			fill_style = $(el).attr("data");
		}
	})	
})

// 获取颜色
let color = '#000000';
$(".color_set input").change(function(){
	color = $(this).val();
})

// 获取线宽
let line_width = 5;
$(".linewidth_set input").val(5); // 设置初始值
$(".linewidth_set input").change(function(){
	line_width = $(this).val();
});



// ---------------  获取鼠标坐标，绘制  ------------------------
let mousedownX, mousedownY, mouseupX, mouseupY;
let mouseIsDown = false;

let images_arr = [];
let canvas_width = canvas.width(), canvas_height = canvas.height();

canvas.mousedown(function(e){
	mouseIsDown = true;

	mousedownX = e.offsetX;
	mousedownY = e.offsetY;

	if(type=="pen"){ // pen整个过程中只有一条路径，而line每次new Draw都会新建一条路径，只显示最后mouseup那条路径
	    ctx.beginPath();
	    ctx.moveTo(mousedownX, mousedownY);
	}
});
canvas.mousemove(function(e){
	if (!mouseIsDown) return;
	mouseupX = e.offsetX;
	mouseupY = e.offsetY;
	// console.log(mousedownX, mousedownY, mouseupX, mouseupY);

	let draw = new Draw(ctx, {fill_style: fill_style, color: color, line_width: line_width});
	
	if (type != "eraser") {
		// 清除指定的矩形区域，然后这块区域会变的完全透明。
		ctx.clearRect(0, 0, canvas_width, canvas_height);
		
		// 将图像数据（从指定的 ImageData 对象）放回画布上。
		if(images_arr.length != 0){
	        ctx.putImageData(images_arr[images_arr.length-1], 0, 0, 0, 0, canvas_width, canvas_height);
	    }
    }

    // 绘制新的图画
    if (type=="pen") {
    	draw.pen(mouseupX, mouseupY);
    } else if (type=="line") {
    	draw.line(mousedownX, mousedownY, mouseupX, mouseupY);
    }else if (type=="rect") {
    	draw.rect(mousedownX, mousedownY, mouseupX, mouseupY);
    } else if (type=="circular") {
    	draw.circular(mousedownX, mousedownY, mouseupX, mouseupY);
    } else if (type=="poly") {
    	draw.poly(mousedownX, mousedownY, mouseupX, mouseupY, poly_n);
    } else if (type=="eraser") {
    	draw.eraser(mouseupX, mouseupY);
    }
});

canvas.mouseup(function(e){
	mouseIsDown = false;

	// 该对象拷贝了画布指定矩形的像素数据，返回 ImageData 对象。
	images_arr.push(ctx.getImageData(0, 0, canvas_width, canvas_height));
});

// ------------------- 撤销 清空 生成图片 ------------------------
$(".clear").click(function(){
	images_arr = [];
	ctx.clearRect(0, 0, canvas_width, canvas_height);
})

$("[data-toggle='tooltip']").tooltip();
$(".rollback").click(function(){
	images_arr.pop();
	ctx.clearRect(0, 0, canvas_width, canvas_height);
	if (images_arr.length != 0) {
		ctx.putImageData(images_arr[images_arr.length-1], 0, 0, 0, 0, canvas_width, canvas_height);
	}
})

$(".canvas2img").click(function(){
	let imgUri = document.querySelector("canvas").toDataURL();
	// window.location.href = imgUri; // 下载图片  chrome禁止从页面打开data URI地址
	
	// 生成一个a元素
    let a = document.createElement('a')

    // 将a的download属性设置为我们想要下载的图片名称
    a.download = 'canvas.png'
    // 将生成的URL设置为a.href属性
    a.href = imgUri

    // 创建一个单击事件
    // let event = new MouseEvent('click')
    // 触发a的单击事件    
    // a.dispatchEvent(event)
    a.click();
})

});
