<template>
  <div>
    <div id="mapDiv">
      <div id="map" class="map"></div>
    </div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { OverviewMap, ScaleLine, MousePosition, defaults } from "ol/control";
import { format } from "ol/coordinate";
export default {
  data() {
    return {
      map: "",
    };
  },
  mounted() {
    this.maps();
  },
  methods: {
    maps() {
      const map = new Map({
        target: "mapDiv",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([112.0, 30.0]),
          zoom: 4,
        }),
        controls: defaults().extend([
          // 添加一个鹰眼控件
          new OverviewMap({
            // 实例化一个OverviewMap类的对象，并加入到地图中
            collapsed: false,
            view: new View({
              center: [112.0, 30.0],
            }),
            layers: [
              new TileLayer({
                source: new OSM(),
              }),
            ],
          }),
          // 添加比例尺
          new ScaleLine({
            units: "metric",
          }),
          new MousePosition({
            coordinateFormat: function (coordinate) {
              return format(coordinate, "经度:{x} 纬度:{y}", 2);
            },
            projection: "EPSG:4326",
            className: "custom-mouse-position",
            target: document.getElementById("mouse-position"),
            undefinedHTML: "&nbsp;",
          }),
        ]),
      });
    },
  },
};
</script>

<style scoped>
#mapDiv {
  position: absolute;
  width: 100%;
  height: 100vh;
}
</style>
