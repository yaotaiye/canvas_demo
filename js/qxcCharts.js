/**
 * Created by wty on 2017/7/3.
 */
(function (w) {
    function qxcBoard (opt) {
        this.canvas=document.getElementById(opt.id);
        this.canvas2=document.getElementById(opt.canvas2);
        this.prev=document.getElementById(opt.prev);
        this.clear=document.getElementById(opt.clear);
        this.save=document.getElementById(opt.save);
        this.scaleAdd=document.getElementById(opt.scaleAdd);
        this.scaleReduce=document.getElementById(opt.scaleReduce);
        this.freeLineBtn=document.getElementById(opt.freeLineBtn);
        this.lockBtn=document.getElementById(opt.lock);
        this.ctx=this.canvas.getContext("2d");
        this.ctx2=this.canvas2.getContext("2d");
        this.winW=document.body.clientWidth;
        this.drawDataArr=[];
        this.firstDraw=null;
        this.qxcNumber=opt.qxcNumber;
        this.axisH=36;
        this.pointsColor=opt.pointsColor || "rgba(255,133,6,.2)";
        this.gridColor=opt.gridColor || 'red';
        this.gridBgColor=opt.gridBgColor || '#fff';
        this.lineWidth=opt.lineWidth || 2;
        this.lineColor=opt.lineColor || 'red';
        this.stepX=this.winW*0.9/10;
        this.drawStep=0;
        this.imgType=opt.imgType || 'png';
        this.circles = []; // 可连线的点
        this.r=this.stepX/2*0.8;
        this.touchFlag = false; // 用于判断是否 touch 到 circle
        this.clickIndex=1;
        this.prevIndex=1;
        this.freeDraw=false;
        this.moreLine=5;
        this.lock=true;
        this.init()
    }
    qxcBoard.prototype={
        init:function () {
            this.canvas.width=this.winW*0.9;
            this.canvas.height=(this.qxcNumber.length+5)*this.axisH;

            this.canvas2.height= this.canvas.height;
            this.canvas2.width=this.canvas.width;
            this.canvas2.style.position = 'absolute';
            this.canvas2.style.top = '0';
            this.canvas2.style.zIndex = '-1';
            this.canvas2.style.left = this.winW*0.05+'px';
            this.throttle();
            this.drawAxis();
            this.createListener();
        },
        drawAxis:function () {
            var self=this,ctx=self.ctx;
            var step=self.stepX;
            //写数据
            ctx.font="16px Arial";
            ctx.fillStyle=self.gridColor;
            ctx.beginPath();
            //x轴
            for(var i=0,len=self.qxcNumber.length+self.moreLine;i<=len;i++){
                ctx.moveTo(0,self.axisH*i);
                ctx.lineTo(self.canvas.width,self.axisH*i);
            }
            //y轴
            for(var j=0;j<=9;j++){
                if(j==9){
                    ctx.moveTo(self.canvas.width,0);
                    ctx.lineTo(self.canvas.width,self.canvas.height);
                }
                else if(j==0){
                    ctx.moveTo(0,0);
                    ctx.lineTo(0,self.canvas.height);
                }
                else{
                    ctx.moveTo(step*(j+1),0);
                    ctx.lineTo(step*(j+1),self.canvas.height);
                }

            }

            ctx.closePath();
            ctx.strokeStyle=self.gridColor;
            ctx.stroke();
            //写数据
            self.qxcNumber.forEach(function (item,index) {
                var textW=ctx.measureText(item.qi).width;
                ctx.fillText(item.qi,step-textW/2,index*self.axisH+25);
                var num=item.data.split(",");
                var addText=0;
                num.forEach(function (item2,index2) {
                    if(index2<4){
                        addText+=(item2-0);
                        ctx.font=" bold 20px Arial";
                    }else{ctx.font="16px Arial";}
                    var textW2=ctx.measureText(item2).width;
                    if(index2==4){
                        var pos={
                            x: 2.5*step,
                            y: index*self.axisH+self.axisH/2
                        }
                        self.circles.push(pos);

                        self.ctx.fillStyle = self.lineColor;
                        var addW= ctx.measureText(addText).width;
                        ctx.fillText(addText,2.5*step-addW/2,index*self.axisH+self.axisH*0.7);
                    }
                    var p={
                        x: 3.5*step+index2*step,
                        y: index*self.axisH+self.axisH/2
                    }
                    self.circles.push(p);

                    self.ctx.fillStyle = self.lineColor;
                    ctx.fillText(item2,3.5*step+index2*step-textW2/2,index*self.axisH+self.axisH*0.7);

                })
            });
            //增加空白的可绘制的点
            for(i=0;i<self.moreLine;i++){
                for(j=0;j<8;j++){
                    var p={
                        x: 2.5*step+j*step,
                        y: (self.qxcNumber.length+i)*self.axisH+self.axisH/2
                    }
                    self.circles.push(p);
                }
            }

            // console.log( self.circles)
            self.firstDraw=self.ctx.getImageData(0,0,self.canvas.width,self.canvas.height)
            self.drawDataArr.push(self.firstDraw);


        },
        getTouchPos: function(e){ // 获得触摸点的相对位置
            var rect = e.target.getBoundingClientRect();
            var p = { // 相对坐标
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
            return p;
        },
        reset: function(){ // 重置 canvas

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // 先清空
        },
        throttle: function(){
            if (!Date.now){ Date.now = function() { return new Date().getTime(); }}
            var vendors = ['webkit', 'moz'];
            for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
                var vp = vendors[i];
                window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
                window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                || window[vp+'CancelRequestAnimationFrame']);
            }
            if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)|| !window.requestAnimationFrame || !window.cancelAnimationFrame) {
                var lastTime = 0;
                window.requestAnimationFrame = function(callback) {
                    var now = Date.now();
                    var nextTime = Math.max(lastTime + 16, now);
                    return setTimeout(function() { callback(lastTime = nextTime); },
                        nextTime - now);
                };
                window.cancelAnimationFrame = clearTimeout;
            }
        },
        createListener:function () {
            var self=this;

            this.canvas.addEventListener('touchstart', function(e){
                if(self.lock) {
                    var p = self.getTouchPos(e);
                    if (self.freeDraw) {
                        self.ctx.beginPath();
                        self.ctx.moveTo(p.x, p.y);
                    } else {
                        self.judgePos(p); //判断点位置，存点击后的点，及删除
                        self.drawPoints(self.clickIndex);//画圆点
                        self.lineStar(self.clickIndex);//画线
                    }
                }

            })
            this.canvas.addEventListener('touchmove', function (e) {
                if(self.lock){
                    e.preventDefault();
                    window.requestAnimationFrame(function () {
                        var p = self.getTouchPos(e);
                        if(self.freeDraw){
                            self.freeLine(p);
                        }else{
                            self.ctx2.clearRect(0,0,self.canvas.width,self.canvas.height);
                            self.ctx2.beginPath();
                            self.ctx2.moveTo(self.circles[self.clickIndex].x,self.circles[self.clickIndex].y);
                            self.ctx2.lineTo(p.x,p.y);
                            self.ctx2.strokeStyle=self.lineColor;
                            self.ctx2.stroke();
                            self.ctx2.closePath();
                        }
                    });
                }


            }, false);

            this.canvas.addEventListener("touchend",function (e) {
                if(self.lock) {
                    if (!self.freeDraw) {
                        //连线
                        var rect = e.target.getBoundingClientRect();
                        var p = { // 相对坐标
                            x: e.changedTouches[0].clientX - rect.left,
                            y: e.changedTouches[0].clientY - rect.top
                        };
                        self.judgePos(p);
                        self.lineEnd(self.clickIndex, self.prevIndex);
                        self.drawPoints(self.clickIndex);
                    }
                    //清除连线
                    self.ctx2.clearRect(0, 0, self.canvas.width, self.canvas.height);
                    //历史记录
                    self.drawDataArr.push(self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height));
                    self.drawStep += 1;
                }

            },false);
            this.prev.addEventListener("touchstart",function () {
                if(self.drawStep>0){
                    self.reDo(--self.drawStep);
                    self.drawDataArr.pop()
                }
            });
            this.clear.addEventListener("touchstart",function () {
                if(self.drawDataArr.length-1){
                    self.reset();
                    self.ctx.putImageData(self.drawDataArr[0],  0,  0);
                    self.drawDataArr.splice(0,self.drawDataArr.length);
                    self.drawDataArr.push(self.firstDraw)
                    self.drawStep=0;
                }
            });
            this.save.addEventListener("touchstart",function () {
                self.saveImg();
            });
            this.scaleAdd.addEventListener("touchstart",function () {
                self.lineWidth+=1;
            })
            this.scaleReduce.addEventListener("touchstart",function () {
                if(self.lineWidth>2){
                    self.lineWidth-=1;
                }
            })
            this.freeLineBtn.addEventListener("touchstart",function () {
                if(self.freeDraw){
                    self.freeDraw=false;
                    self.freeLineBtn.innerHTML='自由线模式';
                }else{
                    self.freeDraw=true;
                    self.freeLineBtn.innerHTML='取消自由线模式'
                }

            });
            this.lockBtn.addEventListener("touchstart",function () {
                if(self.lock){
                    self.lock=false;
                    this.innerHTML='上锁';
                }else{
                    self.lock=true;
                    this.innerHTML='解锁'
                }

            });

        },
        freeLine:function (pos) {
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.strokeStyle=this.lineColor;
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        },
        reDo:function (index) {
            this.reset();
            this.ctx.putImageData(this.drawDataArr[index],  0,  0)
        },
        saveImg:function () {
            //背景填充
            /*  this.reset();
             this.ctx.fillStyle = this.gridBgColor;
             this.ctx.fillRect (0, 0, this.canvas.width, this.canvas.height);
             this.ctx.putImageData(this.drawDataArr[this.drawDataArr.length-1],  0,  0);*/

            //设置保存图片的类型
            var imgdata = this.canvas.toDataURL(this.imgType);
            //将mime-type改为image/octet-stream,强制让浏览器下载
            var fixtype = function (type) {
                type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
                var r = type.match(/png|jpeg|bmp|gif/)[0];
                return 'image/' + r;
            }
            imgdata = imgdata.replace(fixtype(this.imgType), 'image/octet-stream')
            //将图片保存到本地
            var saveFile = function (data, filename) {
                var link = document.createElement('a');
                link.href = data;
                link.download = filename;
                var event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                link.dispatchEvent(event);
            }
            var filename = new Date().toLocaleDateString() + '.' + this.imgType;
            saveFile(imgdata, filename);

        },
        drawPoints: function(index){ // 画实心圆(点)
            this.ctx.fillStyle = this.pointsColor;
            this.ctx.beginPath();
            this.ctx.arc(this.circles[index].x, this.circles[index].y, this.r, 0, Math.PI * 2, true);
            this.ctx.fill();
            this.ctx.closePath();
        },
        lineStar:function (index) {
            this.ctx.beginPath();
            this.ctx.lineWidth=this.lineWidth;
            this.ctx.strokeStyle=this.lineColor;
            this.ctx.moveTo(this.circles[index].x,this.circles[index].y);
        },
        lineEnd:function (index,prev) {
            //  设置曲线的控制点
            var prevX=this.circles[prev].x, prevY=this.circles[prev].y,
                lastX=this.circles[index].x, lastY=this.circles[index].y,
                ctrX=0,ctrY=0;
            if(lastX==prevX && lastY>prevY){//垂直线的时候
                ctrY=(lastY-prevY)/2+prevY;
                ctrX=lastX-20;
            }else if(lastX>prevX && lastY==prevY){//水平的时候
                ctrX=(lastX-prevX)/2+prevX;
                ctrY=lastY+20;
            }else{
                ctrX=prevX+(lastX-prevX)/3;
                ctrY=lastY;
            }
            this.ctx.quadraticCurveTo(ctrX,ctrY,lastX,lastY);
            this.ctx.stroke();
            this.ctx.closePath();
        },
        judgePos: function(p){ // 判断 触点 是否在 circle 內
            for(var i = 0; i < this.circles.length; i++){
                var temp = this.circles[i];
                if(Math.abs(p.x - temp.x) < this.r && Math.abs(p.y - temp.y) < this.r){
                    this.prevIndex=this.clickIndex;
                    this.clickIndex=i;
                    return;
                }
            }

        }

    }

    window.qxcBoard=qxcBoard;

})(window)