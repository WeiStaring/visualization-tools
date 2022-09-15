<template>
    <div id="viewblock">
        <h3>{{msg}}</h3>
    </div>
</template>

<script>
export default{
    data(){
        return {
            msg:"hello world"
        }
    }
}
</script>

<style>
#viewblock{
    flex: 1; /**占父容器主轴的权重 */
}
</style>