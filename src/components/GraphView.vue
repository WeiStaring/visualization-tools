<template>
    <div id="graphview">
        <div class="title">
            <div class="title-left">{{title}}</div>
            <div class="title-right">
                <el-select class="title-select" v-model="options_value" clearable size="mini" placeholder="select action">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                 </el-select>
            </div>
        </div>
        <div class="view">
            <svg id="graph-svg" @click="start_action($event)"></svg>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3'

export default{
    data(){
        return {
            title:"GraphView",
            options_value: '',
            options: [{
                value: 'none',
                label: 'none'
            },{
                value: 'add node',
                label: 'add node'
            },{
                value: 'add link',
                label: 'add link'
            },{
                value: 'del node',
                label: 'del node'
            },{
                value: 'del link',
                label: 'del link'
            },],
            node_id:0,
            nodes_dic:{},
            links:[],
            links_dic:{},
            prepare_link:[],
        }
    },
    mounted(){
        let vue_this = this;
        this.svg = d3.select("#graph-svg")
        this.width = this.svg.node().parentNode.clientWidth;
        this.height = this.svg.node().parentNode.clientHeight;
        this.svg.attr("width", this.width).attr("height", this.height);
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        this.left = this.svg.node().getBoundingClientRect().left  //js 获取svg离屏幕左边的距离
        this.top = this.svg.node().getBoundingClientRect().top  //js 获取svg离屏幕上边的距离

        this.link_g = this.svg.append('g')
        this.node_g = this.svg.append("g") // 让node图层在link图层上面
        this.tooltip = d3.select("body")
            .append("div")
            .style("position","absolute")
            .attr("opacity",0.0);
        this.add_arrow() // 定义箭头形状
    },
    methods:{
        start_action:function(e){
            this.x = e.x - this.left  // 计算鼠标在svg中的相对位置
            this.y = e.y - this.top

            if(this.options_value=="add node"){
                this.add_node()
            }
        },
        dragged:function(e,d){
            if(this.options_value == "选项3" || this.options_value == "选项4") return;
            d.x = e.x
            d.y = e.y
            this.nodes_dic[e.subject.id].x = e.x
            this.nodes_dic[e.subject.id].y = e.y
            this.draw_graph()
        },
        add_node:function(){
            this.nodes_dic[this.node_id]={id:this.node_id,x:this.x,y:this.y}
            this.node_id++
            this.draw_graph()
        },
        add_link:function(){
            if(this.prepare_link[0] in this.nodes_dic && this.prepare_link[1] in this.nodes_dic){
                this.links.push({
                    id:this.prepare_link[0]+"_"+this.prepare_link[1],
                    source:this.nodes_dic[this.prepare_link[0]],
                    target:this.nodes_dic[this.prepare_link[1]],
                })
                this.draw_graph()
            }
        },
        update_link:function(id){
            let temp_links = []
            for(let link of this.links){
                if(link.source.id!=id && link.target.id!=id){
                    temp_links.push(link)
                }
            }
            this.links = temp_links
        },
        del_link:function(id){
            let temp_links = []
            for(let link of this.links){
                if(link.id!=id){
                    temp_links.push(link)
                }
            }
            this.links = temp_links
        },
        compute_curve:function(){
            function compute_bezier(ps,pe){
                const arc = 0.5
                const deltaX = pe[0] - ps[0];
                const deltaY = pe[1] - ps[1];
                const theta = Math.atan(deltaY / deltaX);
                const len = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) / 2 * arc;
                const newTheta = theta - Math.PI / 2;
                let pc1 = [
                    (ps[0] + pe[0]) / 2 + len * Math.cos(newTheta),
                    (ps[1] + pe[1]) / 2 + len * Math.sin(newTheta),
                ];
                let pc2 = [
                    (ps[0] + pe[0]) / 2 - len * Math.cos(newTheta),
                    (ps[1] + pe[1]) / 2 - len * Math.sin(newTheta),
                ];
                let S1 = (ps[0]-pc1[0])*(pe[1]-pc1[1])-(ps[1]-pc1[1])*(pe[0]-pc1[0])
                if(S1>0)return pc1
                return pc2
            }
            function compute_midpoint(ps,pe){
                return [(ps[0] + pe[0]) / 2, (ps[1] + pe[1]) / 2]
            }
            //重新计数link
            this.links_dic = {}
            for(let link of this.links){
                this.links_dic[link.id]=1
            }
            //计算控制点
            let pointData =[]
            for(let link of this.links){
                let start_point = [link.source.x,link.source.y]
                let end_point = [link.target.x,link.target.y]
                let control_point;
                if(link.target.id+"_"+link.source.id in this.links_dic){   //双向边
                    control_point = compute_bezier(start_point,end_point)
                }else{
                    control_point = compute_midpoint(start_point,end_point)
                }
                pointData.push({
                    id:link.id,
                    start:start_point,
                    end:end_point,
                    control:control_point
                })
            }
            return pointData
        },
        draw_graph:function(){
            let vue_this = this

            let temp_node = []
            for(let key in this.nodes_dic){
                temp_node.push(this.nodes_dic[key])
            }

            this.node_g.selectAll('circle')
            .data(temp_node,d=>d.id)
            .join(
                function(enter){
                    return enter.append("circle")
                            .attr("r",5)
                            .attr("fill",'red')
                            .attr("id",d=>"circle_"+d.id)
                            .call(d3.drag().on("drag", vue_this.dragged))
                            .on("mouseover",function(e,d){
                                vue_this.tooltip.html("ID:"+d.id)
                                    .style("left",(e.x)+"px")
                                    .style("top",(e.y+20)+"px")
                                    .style("opacity",1.0);
                            })
                            .on("mouseout",function(){
                                vue_this.tooltip.style("opacity",0.0);
                            })
                },
                function(update){
                    return update
                },
                function(exit){
                    exit.remove()
                }
            )
            .attr("cx",d=>d.x)
            .attr("cy",d=>d.y)


            // 双向边
            let pointData = this.compute_curve()
            this.link_g.selectAll("path")
            .data(pointData,d=>d.id)
            .join(
                function(enter){
                    return enter.append("path")
                            .attr("stroke", 'black')
                            .attr("fill", 'none')
                            .attr("stroke-width", "2px")
                },
                function(update){
                    return update
                },
                function(exit){
                    exit.remove()
                }
            )
            .attr('d', function(d){
                return "M" + d.start[0] + ' ' + d.start[1] + ' '
                    + "Q" + d.control[0] + ' ' + d.control[1] + ' '
                    + d.end[0] + ' ' + d.end[1];
            })
            .attr("marker-end","url(#arrow)");

            // 无向边
            // this.link_g.selectAll("line")
            // .data(this.links,d=>d.id)
            // .join(
            //     function(enter){
            //         return enter.append("line")    
            //                 .attr('id',d=>d.id)
            //                 .attr("stroke", 'black')
            //                 .attr("stroke-width", "2px")
            //     },
            //     function(update){
            //         return update
            //     },
            //     function(exit){
            //         exit.remove()
            //     }
            // )  
            // .attr("x1",d=>d.source.x)
            // .attr("y1",d=>d.source.y)
            // .attr("x2",d=>d.target.x)
            // .attr("y2",d=>d.target.y)
            
        },
        add_arrow:function(){
            var defs = this.svg.append("defs");
            var arrowMarker = defs.append("marker")
                .attr("id","arrow")
                .attr("markerUnits","strokeWidth")
                .attr("markerWidth","8")
                .attr("markerHeight","8")
                .attr("viewBox","0 0 12 12")
                .attr("refX","13")
                .attr("refY","6")
                .attr("orient","auto");
            var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
            arrowMarker.append("path")
                .attr("d",arrow_path)
                .attr("fill","#999");
        },
    },
    watch:{
        options_value:function(newData, oldData){    //管理不同状态下的事件
            let vue_this = this
            switch(this.options_value){
                case 'add link':
                    this.node_g.selectAll('circle')
                    .on("click",function(e,d){
                        vue_this.prepare_link.push(d.id)
                        if(vue_this.prepare_link.length==2){
                            vue_this.add_link()
                            vue_this.prepare_link = []
                        }
                    })
                    break;
                case "del node":
                    this.node_g.selectAll('circle')
                    .on("click",function(e,d){
                        let id = d.id
                        d3.select(this).remove()
                        delete vue_this.nodes_dic[id]
                        vue_this.update_link(id)
                        vue_this.draw_graph()
                    })
                    break;
                case 'del link':
                    this.link_g.selectAll('path')
                    .on("click",function(e,d){
                        let id = d.id
                        d3.select(this).remove()
                        vue_this.del_link(id)
                        vue_this.draw_graph()
                    })
                    break;
            }
        },
    }
}
</script>

<style scoped> /* scss是css预处理器，scoped表示是局部style*/
#graphview{
    flex: 1; /**占父容器主轴的权重 */

    display: flex;
    flex-direction: column;
}

.title{
    flex-basis: 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;  /*使得元素垂直居中*/
}

.title .title-left{
    margin: 0;
}

.title .title-right .title-select{
    width: 120px;
}



.title .title-button{
    height: 20px;
    padding: 0;
    font-size: 10px;
}
.view{
    flex: 1; /*graphview的子元素中只有它设置了flex，因此自动占满剩余空间 */
}
</style>