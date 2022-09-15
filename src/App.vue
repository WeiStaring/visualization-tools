<template>
  <div id="app">
    <div class="top">
      <GraphView></GraphView>

      <ViewBlock></ViewBlock>
      <ViewBlock></ViewBlock>
    </div>
    <div class="bottom">
      <ViewBlock></ViewBlock>
      <ViewBlock></ViewBlock>
      <ViewBlock></ViewBlock>
    </div>
  </div>
</template>

<script>

import ViewBlock from './components/ViewBlock.vue';
import GraphView from './components/GraphView.vue';

export default{
  data(){
    return{

    }
  },
  components:{ ViewBlock, GraphView}
}

</script>

<style>
#app {
  display: flex;
  height: 500px;
  flex-direction: column; /*从上到下排列 */

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

}
.top {
  display: flex;
  flex-direction: row; /*从左到右排列 */
  justify-content: space-between; /*主轴居中 */
  /* align-items: center; 副轴居中 */
  flex: 1;

}
.bottom {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  /* align-items: center; */
  flex: 1;
}
</style>
