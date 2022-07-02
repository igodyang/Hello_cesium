<template>
  <div></div>
</template>

<script>
export default {
  methods: {
    loadtiles() {
      var tileset = viewer.scene.primitives.add(
        new this.Cesium.Cesium3DTileset({
          url: "../static/cd-new/tileset.json", //数据地址
          maximumScreenSpaceError: 2, //最大的屏幕空间误差
          maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
          //modelMatrix: m, //形状矩阵
        })
      );
      tileset.readyPromise.then(function (tile) {
        tile.style = new this.Cesium.Cesium3DTileStyle({
          color: {
            conditions: [["true", "color('rgb(51, 153, 255)',1)"]],
          },
        });
      });
      viewer.flyTo(tileset);
    },
  },
};
</script>