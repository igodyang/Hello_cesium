<template>
  <div>
    <div id="cesiumContainer">
      <div id="overview" class="leaflet-control-minimap"></div>
    </div>
    <div class="scale-container">
      <div class="scale-label">{{ distanceLabel || "out of range" }}</div>
      <div
        v-if="barWidth"
        class="scale-bar"
        :style="{ width: barWidth + 'px' }"
      ></div>
    </div>
  </div>
</template>
<script>
import { OverMap } from "../utils/yfcesium";
export default {
  name: "initcesium",
  data() {
    return {
      distanceLabel: undefined,
      barWidth: undefined,
    };
  },
  mounted() {
    this.initCesium();
    this.initOverview({
      viewer: window.viewer,
      L: this.L,
    });
  },
  methods: {
    initCesium() {
      let that = this;
      let Cesium = this.Cesium;
      let viewer = new Cesium.Viewer("cesiumContainer", {
        //terrainProvider: Cesium.createWorldTerrain(),
        animation: false,
        fullscreenButton: false, //全屏按钮,默认显示true
        sceneModePicker: false, // 3D/2D切换按钮，默认显示true
        navigationHelpButton: false, //导航帮助按钮，默认显示true
        geocoder: false, //地名查找,默认true
        timeline: false, //时间线,默认true
        vrButton: false, //双屏模式,默认不显示false
        homeButton: false, //主页按钮，默认true
        infoBox: false, //点击要素之后显示的信息,默认true
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          //url: "https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png", //标准风格
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", //黑色风格
          subdomains: ["a", "b", "c", "d"],
        }),
      });
      viewer.scene.requsetRenderMode = false;
      viewer.scene.globe.depthTestAgainstTerrain = true;
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
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(110.2, 34.55, 10000000),
      });
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

    initOverview(arg) {
      var url = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      var layer = new arg.L.TileLayer(url, {
        minZoom: 0,
        maxZoom: 20,
      });
      var container = document.getElementById("overview");
      var options = {
        container: container,
        toggleDisplay: true,
        width: 150,
        height: 150,
        position: "topright",
        aimingRectOptions: {
          color: "#ff1100",
          weight: 2,
        },
        shadowRectOptions: {
          color: "#0000AA",
          weight: 1,
          opacity: 0,
          fillOpacity: 0,
        },
      };
      let overviewCtr = new OverMap({
        layer: layer,
        viewer: arg.viewer,
        options: options,
        L: arg.L,
      });
      overviewCtr.init();
    },
  },
};
</script>
<style scope>
#cesiumContainer {
  position: absolute;
  width: 100%;
  height: 100%;
}
.scale-container {
  position: absolute;
  z-index: 1001;
  left: 0;
  bottom: 5%;
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
</style>