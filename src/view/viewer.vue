<template>
  <div>
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
        <el-submenu index="1">
          <template slot="title">二三维切换</template>
          <el-menu-item index="1-1" @click.native="menuchange('openlayer')"
            >TO2D</el-menu-item
          >
          <el-menu-item index="1-2" @click.native="menuchange('initcesium')"
            >TO3D</el-menu-item
          >
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">功能案例</template>
          <el-menu-item index="2-1">视锥体</el-menu-item>
          <el-submenu index="2-2">
            <template slot="title">扫描效果</template>
            <el-menu-item index="2-2-1" @click="showScan('1')"
              >清除效果</el-menu-item
            >
            <el-menu-item index="2-2-2" @click="showScan('2')"
              >扩散圆</el-menu-item
            >
            <el-menu-item index="2-2-3" @click="showScan('3')"
              >扩散点</el-menu-item
            >
            <el-menu-item index="2-2-4" @click="showScan('4')"
              >雷达扫描</el-menu-item
            >
            <el-menu-item index="2-2-5" @click="showScan('5')"
              >雷达遮罩扫描</el-menu-item
            >
          </el-submenu>
          <el-menu-item index="2-3">公告牌</el-menu-item>
          <el-menu-item index="2-4">热力图</el-menu-item>
          <el-menu-item index="2-5">飞线特效</el-menu-item>
          <el-menu-item index="2-6">流动轨迹线</el-menu-item>
          <el-menu-item index="2-7" @click="showFlood(0)"
            >淹没分析</el-menu-item
          >
        </el-submenu>
        <el-submenu index="3">
          <template slot="title">量测工具</template>
          <el-menu-item index="3-1">距离测量</el-menu-item>
          <el-menu-item index="3-2">面积测量</el-menu-item>
        </el-submenu>
        <el-submenu index="4">
          <template slot="title">特效展示</template>
          <el-menu-item index="4-1">自动旋转</el-menu-item>
          <el-submenu index="4-2">
            <template slot="title">天气特效</template>
            <el-menu-item index="4-2-1" @click="weather('clear')"
              >清除特效</el-menu-item
            >
            <el-menu-item index="4-2-2" @click="weather('yu')"
              >雨天特效</el-menu-item
            >
            <el-menu-item index="4-2-3" @click="weather('snow')"
              >雪天特效</el-menu-item
            >
            <el-menu-item index="4-2-4" @click="weather('fog')"
              >雾天特效</el-menu-item
            >
          </el-submenu>
          <el-menu-item index="4-3">城市特效</el-menu-item>
          <el-submenu index="4-4">
            <template slot="title">泛光特效</template>
            <el-menu-item index="4-4-1" @click="setbloom('start')"
              >开启</el-menu-item
            >
            <el-menu-item index="4-4-2" @click="setbloom('stop')"
              >关闭</el-menu-item
            >
          </el-submenu>
          <el-submenu index="4-5">
            <template slot="title">水面波浪</template>
            <el-menu-item index="4-5-1" @click="setWater(1)">开启</el-menu-item>
            <el-menu-item index="4-5-2" @click="setWater">移除</el-menu-item>
          </el-submenu>
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
      <div id="Container" :is="currentview"></div>
    </div>
    <div id="icon">
      <img src="../icons/yang.png" width="110px" height="60px" />
    </div>
    <div id="flood">
      <p style="display: inline">最大高度(米):</p>
      <input type="text" value="150" id="maxHeight" />
      <br />
      <p style="display: inline">最小高度(米):</p>
      <input type="text" value="0" id="minHeight" />
      <br />
      <p style="display: inline">淹没时间(秒):</p>
      <input type="text" value="1" id="floodSpeed" />
      <br />
      <button @click="showFlood(1)">绘制范围</button>
      <button @click="showFlood(2)">淹没分析</button>
      <button @click="showFlood(3)">清除</button>
      <button @click="showFlood(4)">关闭返回</button>
    </div>
    <div>
      <button @click="loadtiles">加载3dtiles</button>
      <load3dtiles ref="load3dtiles/" />
    </div>
  </div>
</template>
<script>
import initcesium from "../components/initcesium.vue";
import openlayer from "./openlayer.vue";
import {
  yangweather,
  yangrotate,
  yangScan,
  yangTrack,
  yangFlood,
  yangWater,
} from "../utils/yfcesium";
import circle2 from "../icons/circlerun.png";
import load3dtiles from "../components/load3dtiles.vue";
export default {
  name: "viewer",
  components: {
    initcesium,
    openlayer,
    load3dtiles,
  },
  data() {
    return {
      activeIndex: "1",
      activeIndex2: "1",
      currentview: "initcesium",
    };
  },
  mounted() {
    this.rotate();
  },
  methods: {
    //输出点击index
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    //二三维界面切换
    menuchange(menu) {
      this.currentview = menu;
    },
    //天气特效
    weather(mode) {
      window.viewer.scene.postProcessStages.removeAll();
      let yf = new yangweather();
      if (mode == "yu") {
        yf.setRainEffect();
      } else if (mode == "snow") {
        yf.setSnowEffect();
      } else if (mode == "fog") {
        yf.setFogEffect();
      } else if (mode == "clear") {
        window.viewer.scene.postProcessStages.removeAll();
      }
    },
    //城市泛光
    setbloom(mode) {
      let bloom = new yangScan();
      if (mode == "start") {
        bloom.setBloomLightScene();
      } else {
        bloom.setBloomstop();
      }
    },
    //地球旋转
    rotate() {
      let yf = new yangrotate();
      var handler = new this.Cesium.ScreenSpaceEventHandler(
        window.viewer.scene.canvas
      );
      handler.setInputAction(function (click) {
        yf.stop();
        //console.log("左键单击事件：", click.position);
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(function (click) {
        yf.start();
        //console.log("左键双击事件：", click.position);
      }, this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },
    //扫描效果
    showScan(mode) {
      let scan = new yangScan();
      const color = new this.Cesium.Color(1.0, 0.0, 0.0, 1);
      if (mode == "1") {
        console.log("处理中。。。。。。请等待");
      } else if (mode == "2") {
        let lng = 30.50025;
        let lat = 104.1;
        scan.circleRun({
          position: [lat, lng, 1000],
          minR: 1000,
          maxR: 10000,
          deviationR: 10,
          img: circle2,
        }); // 添加动态圆扩散
      } else if (mode == "3") {
        scan.pointRun({
          positions: [104.942811, 30.632272, 1000],
          maxR: 1000,
          deviationR: 1, //差值大速度快
          time: 2000, //内外时间间隔
          img: circle2,
        }); // 添加动态圆点
      } else if (mode == "4") {
        scan.radarScan([104.9, 30.66, 100], 5000, color, 5000); //雷达扫描
      } else if (mode == "5") {
        let track = new yangTrack({
          viewer: viewer,
          id: 1,
          shortwaveRange: 100000.0,
          position: [104, 30.1],
        });
      }
    },
    //淹没分析
    showFlood(mode) {
      document.getElementById("flood").style.display = "block";
      let cheight = parseFloat(document.getElementById("minHeight").value);
      let mheight = parseFloat(document.getElementById("maxHeight").value);
      let time = parseFloat(document.getElementById("floodSpeed").value);
      let yflood = new yangFlood();
      if (mode == 0) {
        yflood.init();
      } else if (mode == 1) {
        yflood.drawPolygon();
      } else if (mode == 2) {
        yflood.flood(cheight, mheight, time);
      } else if (mode == 3) {
        viewer.entities.removeAll();
        viewer.scene.primitives.removeAll();
      } else if (mode == 4) {
        document.getElementById("flood").style.display = "none";
        viewer.entities.removeAll();
        viewer.scene.primitives.removeAll();
      }
    },
    //3dtiles
    loadtiles() {
      this.$refs.load3dtiles.loadtiles();
    },
    //水面波浪
    setWater(mode) {
      if (mode == 1) {
        let ywater = new yangWater();
        ywater.drawWater();
      } else {
        window.viewer.scene.primitives.removeAll();
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
#Container {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
#icon {
  position: absolute;
  right: 0;
  z-index: 1001;
  top: 0;
}
.el-menu-item:hover {
  background: #1c88cf !important;
  color: #fff !important;
}
.el-submenu__title:hover {
  background: #1c88cf !important;
  color: #fff !important;
}
#flood {
  position: absolute;
  width: 18%;
  height: 12%;
  top: 10%;
  left: 40%;
  z-index: 1001;
  background: rgba(82, 128, 197, 0.8);
  border: 1px solid burlywood;
  display: none;
}
</style>