/**
 * Created by wty on 2017/6/26.
 */
   function wtychart (opt) {
       this.opt=Object.assign({
           width:300,//画布宽度
           height:150,//画布高度
           lineColor:'#ff8444',//线颜色
           lineBgColor:'rgba(255, 136, 120, 0.2)',//折线区域填充色
           drawBg:true,
           AxisBg:'#f5f5f5',
           lineType:"cruve",//曲线绘制
           points:[],//绘制的点
           lineWidth:1,//线的宽度
           axisB:40,//网格底边距
           axisL:40,//网格左边距
           axisR:40,//网格右边距
           axisT:40,//网格顶边距
       },opt);
       this.init()

   }
  wtychart.prototype={
      init:function () {
          this.canvas=document.getElementById(this.opt.canvasId);
          this.ctx=this.canvas.getContext("2d");
          this.initConfig();
          return this;
      },
      initConfig:function () {
          this.canvas.width=this.opt.width;
          this.canvas.height=this.opt.height;
          this.ctx.fillStyle=this.opt.AxisBg;
          this.ctx.fillRect(0,0,this.opt.width,this.opt.height);
          this.axis();
          this.drawLine()
      },
      clear: function () {
          var ctx = this.ctx;
          ctx.clearRect(0, 0, this.opt.width, this.opt.height);
      },
      pushPoints:function (data,max,len,step) {
          var self=this;
          var arr=[];
          data.forEach(function (item,index) {
              arr.push({x: step * index + 1.5 * self.opt.axisL, y: ((max - item) / max) * self.opt.lastY - 2});
          });
          self.opt.points.push(arr);
      },
      line:function (point,data) {
          var self=this;
          var ctx = this.ctx;
          ctx.strokeStyle= data.lineColor? data.lineColor :self.opt.lineColor;
          point.forEach(function (item,index) {
              if(index==0){
                  ctx.beginPath();
                  ctx.moveTo(point[index].x,point[index].y);
              }
              ctx.lineTo(point[index].x,point[index].y);
          });
          ctx.stroke();
          ctx.lineTo(point[point.length - 1].x,self.opt.lastY); //x轴终点
          ctx.lineTo(1.5*self.opt.axisL,self.opt.lastY);//x轴起点
          ctx.closePath();
          if(data.drawBg){
              ctx.fillStyle = data.lineBgColor? data.lineBgColor:self.opt.lineBgColor;
              ctx.fill();
          }

      },
      /*
       *根据已知点获取第i个控制点的坐标
       *param ps	已知曲线将经过的坐标点
       *param i	第i个坐标点
       *param a,b	可以自定义的正数
       */
      getCtrlPoint:function (ps, i, a, b) {
          if(!a||!b){
              a=0.25;
              b=0.25;
          }
          //处理两种极端情形
          if(i<1){
              var pAx = ps[0].x + (ps[1].x-ps[0].x)*a;
              var pAy = ps[0].y + (ps[1].y-ps[0].y)*a;
          }else{
              var pAx = ps[i].x + (ps[i+1].x-ps[i-1].x)*a;
              var pAy = ps[i].y + (ps[i+1].y-ps[i-1].y)*a;
          }
          if(i>ps.length-3){
              var last=ps.length-1
              var pBx = ps[last].x - (ps[last].x-ps[last-1].x)*b;
              var pBy = ps[last].y - (ps[last].y-ps[last-1].y)*b;
          }else{
              var pBx = ps[i+1].x - (ps[i+2].x-ps[i].x)*b;
              var pBy = ps[i+1].y - (ps[i+2].y-ps[i].y)*b;
          }
          return {
              pA:{x:pAx,y:pAy},
              pB:{x:pBx,y:pBy}
          }
      },
      cruveLine:function (point,data) {
          var self=this;
          var ctx = self.ctx;
          ctx.strokeStyle= data.lineColor? data.lineColor :self.opt.lineColor;
          point.forEach(function (item,index) {
              if(index==0){
                  ctx.beginPath();
                  ctx.moveTo(point[index].x,point[index].y);
              }else{//注意是从1开始
                  var ctrlP=self.getCtrlPoint(point,index-1);
                  ctx.bezierCurveTo(ctrlP.pA.x, ctrlP.pA.y, ctrlP.pB.x,ctrlP.pB.y, point[index].x, point[index].y);

              }
          });
          ctx.stroke();
          ctx.lineTo(point[point.length - 1].x,self.opt.lastY); //x轴终点
          ctx.lineTo(1.5*self.opt.axisL,self.opt.lastY);//x轴起点
          ctx.closePath();
          if(data.drawBg){
              ctx.fillStyle = data.lineBgColor? data.lineBgColor:self.opt.lineBgColor;
              ctx.fill();
          }

      },
      writeLineData:function (point,data) { //写数据
          var self=this;
          var ctx = self.ctx;
          ctx.font="12px Arial";
          ctx.fillStyle=data.textColor?data.textColor:self.opt.lineColor;
          point.forEach(function (item,index) {
          ctx.fillText(data.data[index],point[index].x-5,point[index].y-15);
          })
      },
      vLine:function (len,index,data) {
          var ctx = this.ctx;
          var axisL=this.opt.axisL;
          var axisB=this.opt.axisB;
          var axisR=this.opt.axisR;
          var axisT=this.opt.axisT;
          var step = (this.opt.width-1.5*axisL-1.5*axisR)/(len-1);
          //画线
         /* ctx.beginPath();
          ctx.moveTo(step*index+1.5*axisL, axisT);
          ctx.lineTo(step*index+1.5*axisL, this.opt.lastY);
          ctx.strokeStyle='#CCC';
          ctx.stroke();*/
          //年份
          ctx.font="12px Arial";
          ctx.fillStyle="#ccc";
          var textW=ctx.measureText(data[len-index-1]).width;
          ctx.fillText(data[len-index-1],step*(len-index-1)+1.5*axisL-textW/2,this.opt.lastY+20);

      },
      hLine:function (len,index,data,hy_step) {
          //  var that=this;
          var ctx = this.ctx;
          var len=len-1;
          var axixT=this.opt.axisT;
          ctx.beginPath();
          ctx.moveTo(this.opt.axisL, hy_step*index+axixT)
          ctx.lineTo(this.opt.width-this.opt.axisR, hy_step*index+axixT);
          ctx.strokeStyle='#CCC';
          ctx.stroke();
          ctx.font="12px Arial";
          ctx.fillStyle="#ccc"
         // ctx.fillText(Math.round(data*(len-index)),10,step2*index+axisT);
          ctx.fillText(Math.round(data*(len-index)),10,hy_step*index+axixT);
          ctx.textBaseline="middle";
          if(index==len){
              this.opt.lastY=hy_step*index+axixT;
              this.opt.lastX=this.opt.width-this.opt.axisR;
          }

      },
      toolTipe:function (e) {

      },
      axis:function () {

          var len=this.opt.categories.length,that=this,data=this.opt.series,Arr=[],min=[],max=[];
          //获取数据最大值
          for(var a=0;a<data.length;a++){
              [].push.apply(Arr,data[a].data)
          };
          max= Math.max.apply(null,Arr);
          max+=max/(len/5);
           this.opt.maxData=max;
          var  dataStep=this.opt.maxData/len; //y轴每段数据
         // 水平线网格
          var hy_step = (this.opt.height-this.opt.axisB)/len;
          for(var i=0;i<len;i++){
              that.hLine(len,i,dataStep,hy_step)
          }
          //垂直线网格
          for(var j=0;j<len;j++){
              that.vLine(len,j,this.opt.categories)
          }
         //平分线段
          this.opt.lineXStep = (this.opt.width-1.5*this.opt.axisL-1.5*this.opt.axisR)/(len-1);
          //存入点
          for(var k=0;k<data.length;k++){
              this.pushPoints(data[k].data,max,len,this.opt.lineXStep);
          }
          
    
          this.canvas.onmousemove=function (e) {
              e=e||event;
              var x = e.clientX - this.offsetLeft;
              var y = e.clientY - this.offsetTop;
             // console.log(x)
          }
      },
      drawLine:function () {
          var self=this;
          var data=self.opt.series;
          self.opt.points.forEach(function (item,index) {
              if(index<data.length){
                   //线绘制
                  switch (self.opt.lineType){
                      case 'cruve':
                          self.cruveLine(item,data[index]);
                          break;
                      default:
                          self.line(item,data[index])
                  }
                  //写入折线数据
                  self.writeLineData(item,data[index]);

              }
          });




      }
  }