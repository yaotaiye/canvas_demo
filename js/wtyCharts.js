/**
 * Created by wty on 2017/6/26.
 */
   function wtychart (opt) {
       this.opt=Object.assign({
           width:300,//画布宽度
           height:150,//画布高度
           lineColor:'#ff8444',//线颜色
           lineBgColor:'rgba(255, 136, 120, 0.2)',//折线区域填充色
           showLineBg:false,
           type:'line',//类型
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
          this.ctx.fillStyle="#f5f5f5";
          this.ctx.fillRect(0,0,this.opt.width,this.opt.height);
          this.axis()
      },
      clear: function () {
          var ctx = this.ctx;
          ctx.clearRect(0, 0, this.opt.width, this.opt.height);
      },
      line:function (data,max,len,step) {
          var that=this;
          var ctx = this.ctx;
          data.forEach(function (item,index) {
              if(index==0){ctx.beginPath();}
              ctx.lineTo(step*index+1.5*that.opt.axisL,((max-item)/max)*that.opt.lastY-2);
              ctx.strokeStyle=that.opt.lineColor;
              ctx.stroke();
              //绘制闭合轮廓，为填充背景
              if(index+1==len){
                  ctx.lineTo(step*index+1.5*that.opt.axisL,that.opt.lastY);
                  ctx.lineTo(1.5*that.opt.axisL,that.opt.lastY);
                  ctx.closePath();
                  ctx.strokeStyle="transparent";
                  ctx.stroke();
                  if(that.opt.showLineBg){
                      ctx.fillStyle = that.opt.lineBgColor;
                      ctx.fill()
                  }
              }

          })

      },
      writeLineData:function (data,max,len,step) {
          var that=this;
          var that=this;
          var ctx = this.ctx;
          data.forEach(function (item,index) {
          //写数据
          ctx.font="12px Arial";
          ctx.fillStyle=that.opt.lineColor
          ctx.fillText(data[index],step*index+1.5*that.opt.axisL-5,(max-item)/max*that.opt.lastY-15);
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

          var len=this.opt.categories.length;
          var that=this;
          var data=this.opt.series;
          var Arr=[],min=[],max=[];
          //获取数据最大值
          for(var a=0;a<data.length;a++){
              [].push.apply(Arr,data[a].data)
          };
          max= Math.max.apply(null,Arr);
          max+=max/(len/2);
          var  hdata=max/len; //y轴每段数据
         // 水平线网格
          var hy_step = (this.opt.height-this.opt.axisB)/len;
          for(var i=0;i<len;i++){
              that.hLine(len,i,hdata,hy_step)
          }
          //垂直线网格
          for(var j=0;j<len;j++){
              that.vLine(len,j,this.opt.categories)
          }
         //折线
          var lineXStep = (this.opt.width-1.5*this.opt.axisL-1.5*this.opt.axisR)/(len-1);
          for(var k=0;k<data.length;k++){
              this.line(data[k].data,max,len,lineXStep);
              //写入折线数据
              this.writeLineData(data[k].data,max,len,lineXStep);
          };


          this.canvas.onmousemove=function (e) {
              e=e||event;
              var x = e.clientX - this.offsetLeft;
              var y = e.clientY - this.offsetTop;
              console.log(x)
          }




      }
  }