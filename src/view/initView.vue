<template>
  <div style="overflow: hidden">
    <div class="el-header">Hello Cesium</div>
    <div>
      <div class="line"></div>
      <el-menu
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="1" @click="to2dmap">TO2D</el-menu-item>
        <el-submenu index="2">
          <template slot="title">功能案例</template>
          <el-menu-item index="2-1">视锥体</el-menu-item>
          <el-menu-item index="2-2">雷达扫描</el-menu-item>
          <el-menu-item index="2-3">公告牌</el-menu-item>
          <el-menu-item index="2-4">热力图</el-menu-item>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title">量测工具</template>
          <el-menu-item index="3-1">距离测量</el-menu-item>
          <el-menu-item index="3-2">面积测量</el-menu-item>
        </el-submenu>
        <el-submenu index="4">
          <template slot="title">特效展示</template>
          <el-menu-item index="4-1">自动旋转</el-menu-item>
          <el-menu-item index="4-2">雨天特效</el-menu-item>
          <el-menu-item index="4-3">雪天特效</el-menu-item>
          <el-menu-item index="4-4">城市特效</el-menu-item>
        </el-submenu>
        <el-submenu index="5">
          <template slot="title">自定义加载</template>
          <el-submenu index="5-1">
            <template slot="title">时序数据展示</template>
            <el-menu-item index="5-1-1">定位信息加载</el-menu-item>
            <el-menu-item index="5-1-2">时序数据动态展示</el-menu-item>
          </el-submenu>
          <el-submenu index="5-2">
            <template slot="title">常见几何加载</template>
            <el-menu-item index="5-2-1">球</el-menu-item>
            <el-menu-item index="5-2-2">圆柱</el-menu-item>
            <el-menu-item index="5-2-3">长方体</el-menu-item>
          </el-submenu>
          <el-menu-item index="5-3">3dtiles加载</el-menu-item>
          <el-menu-item index="5-4">geojson加载</el-menu-item>
          <el-menu-item index="5-5">gltf加载</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <div>
      <div id="cesiumContainer"></div>
      <div class="scale-container">
        <div class="scale-label">{{ distanceLabel || "out of range" }}</div>
        <div
          v-if="barWidth"
          class="scale-bar"
          :style="{ width: barWidth + 'px' }"
        ></div>
      </div>
    </div>
    <div id="icon">
      <img src="../icons/svg/icon1.png" width="60px" height="60px" />
    </div>
  </div>
</template>
<script>
export default {
  name: "initview",
  data() {
    return {
      activeIndex: "1",
      activeIndex2: "1",
      distanceLabel: undefined,
      barWidth: undefined,
    };
  },
  mounted() {
    this.initCesium();
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    to2dmap() {
      this.$router.replace("/open");
    },
    initCesium() {
      let that = this;
      let Cesium = this.Cesium;
      let viewer = new Cesium.Viewer("cesiumContainer", {
        animation: false, //动画控制，默认true
        baseLayerPicker: true, //地图切换控件(底图以及地形图)是否显示,默认显示true
        fullscreenButton: false, //全屏按钮,默认显示true
        sceneModePicker: false, // 3D/2D切换按钮，默认显示true
        navigationHelpButton: false, //导航帮助按钮，默认显示true
        geocoder: false, //地名查找,默认true
        timeline: false, //时间线,默认true
        vrButton: false, //双屏模式,默认不显示false
        homeButton: false, //主页按钮，默认true
        infoBox: false, //点击要素之后显示的信息,默认true
        imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=ebf64362215c081f8317203220f133eb",
          layer: "tdtBasicLayer",
        }),
      });
      viewer.scene.requsetRenderMode = false;
      viewer.entities.add({
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(-100, 20, -90, 30),
          material: new Cesium.StripeMaterialProperty({
            evenColor: Cesium.Color.YELLOW,
            oddColor: Cesium.Color.RED,
            repeat: 10,
          }),
        },
      });

      window.viewer = viewer;
      // 去除左下角的logo
      viewer._cesiumWidget._creditContainer.style.display = "none";
      // 场景变化监听事件
      viewer.scene.postRender.addEventListener(function () {
        that.cesiumScale(Cesium);
      });
      that.tonorth(Cesium, viewer);
    },
    //导航指北针
    tonorth(Cesium, viewer) {
      let options = {};
      // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
      options.defaultResetView = Cesium.Rectangle.fromDegrees(
        112.6923215,
        37.926471,
        20500
      );
      // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
      options.enableCompass = true;
      // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
      options.enableZoomControls = true;
      // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
      options.enableDistanceLegend = true;
      // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      options.enableCompassOuterRing = true;
      this.CesiumNavigation(viewer, options);
    },

    cesiumScale(Cesium) {
      var geodesic = new this.Cesium.EllipsoidGeodesic();
      var distances = [
        1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000,
        10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000,
        2000000, 3000000, 5000000, 10000000, 20000000, 30000000, 50000000,
      ];
      // Find the distance between two pixels at the bottom center of the screen.
      let scene = window.viewer.scene;
      let width = scene.canvas.clientWidth;
      let height = scene.canvas.clientHeight;

      let left = scene.camera.getPickRay(
        new Cesium.Cartesian2((width / 2) | 0, height - 1)
      );
      let right = scene.camera.getPickRay(
        new Cesium.Cartesian2((1 + width / 2) | 0, height - 1)
      );

      let globe = scene.globe;
      let leftPosition = globe.pick(left, scene);
      let rightPosition = globe.pick(right, scene);

      if (!Cesium.defined(leftPosition) || !Cesium.defined(rightPosition)) {
        this.barWidth = undefined;
        this.distanceLabel = undefined;
        return;
      }

      let leftCartographic =
        globe.ellipsoid.cartesianToCartographic(leftPosition);
      let rightCartographic =
        globe.ellipsoid.cartesianToCartographic(rightPosition);

      geodesic.setEndPoints(leftCartographic, rightCartographic);
      let pixelDistance = geodesic.surfaceDistance;

      // Find the first distance that makes the scale bar less than 100 pixels.
      let maxBarWidth = 100;
      let distance;
      for (
        let i = distances.length - 1;
        !Cesium.defined(distance) && i >= 0;
        --i
      ) {
        if (distances[i] / pixelDistance < maxBarWidth) {
          distance = distances[i];
        }
      }

      if (Cesium.defined(distance)) {
        var label =
          distance >= 1000
            ? (distance / 1000).toString() + " km"
            : distance.toString() + " m";
        this.barWidth = (distance / pixelDistance) | 0;
        this.distanceLabel = label;
      } else {
        this.barWidth = undefined;
        this.distanceLabel = undefined;
      }
    },
  },
};
</script>
<style scope>
.el-header {
  position: absolute;
  z-index: 1001;
  color: #409eff;
  width: 285px;
  text-align: center;
  line-height: 60px;
  font-size: 40px;
  left: 40%;
}
#cesiumContainer {
  position: absolute;
  width: 100%;
  height: 100%;
}
#icon {
  position: absolute;
  right: 0;
  z-index: 1001;
  top: 0;
}
.scale-container {
  position: absolute;
  z-index: 1001;
  left: 0;
  bottom: 0;
  width: 120px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(10, 31, 59, 0.7);
}
.scale-label {
  font-size: 12px;
  color: #fff;
  text-align: center;
}
.scale-bar {
  position: relative;
  padding-top: 10px;
}
.scale-bar::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 10px;
  border: 1px solid #fff;
  border-top: none;
  left: 0;
  bottom: 0;
}
.el-menu-item:hover {
  background: #1c88cf !important;
  color: #fff !important;
}
.el-submenu__title:hover {
  background: #1c88cf !important;
  color: #fff !important;
}
</style>