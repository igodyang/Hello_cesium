const Cesium = require("cesium/Build/cesium/Cesium")
let tileset1, adapCoordi;
/**
 * 天气雨雪雾
 * @param {Viewer} viewer
 * @return {*}
 * 
*/
class yangweather {
    constructor() {
        this.viewer = window.viewer
    }
    setRainEffect() {
        const tiltAngle = .2
        const rainSize = 0.3
        const rainSpeed = 60
        if (viewer) {
            let Rain = "uniform sampler2D colorTexture;\n\
            varying vec2 v_textureCoordinates;\n\
            uniform float tiltAngle;\n\
            uniform float rainSize;\n\
            uniform float rainSpeed;\n\
            float hash(float x) {\n\
                return fract(sin(x * 133.3) * 13.13);\n\
            }\n\
            void main(void) {\n\
                float time = czm_frameNumber / rainSpeed;\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);\n\
                vec3 c = vec3(.6, .7, .8);\n\
                float a = tiltAngle;\n\
                float si = sin(a), co = cos(a);\n\
                uv *= mat2(co, -si, si, co);\n\
                uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;\n\
                float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);\n\
                float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;\n\
                c *= v * b;\n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
            }\n\
            "
            let rainStage = new Cesium.PostProcessStage({
                name: 'yang_rain',
                fragmentShader: Rain,
                uniforms: {
                    tiltAngle: () => {
                        return tiltAngle;
                    },
                    rainSize: () => {
                        return rainSize;
                    },
                    rainSpeed: () => {
                        return rainSpeed;
                    }
                }
            });

            return window.viewer.scene.postProcessStages.add(
                rainStage
            );
        }
    }
    setSnowEffect() {
        if (viewer) {
            let fs = "uniform sampler2D colorTexture;\n\
            varying  vec2 v_textureCoordinates;\n\
            \n\
            float snow(vec2 uv,float scale){\n\
                float time = czm_frameNumber / 60.0;\n\
                float w=smoothstep(1.,0.,-uv.y*(scale/10.));\n\
                if(w<.1)return 0.;\n\
                uv+=time/scale;\n\
                uv.y+=time*2./scale;\n\
                uv.x+=sin(uv.y+time*.5)/scale;\n\
                uv*=scale;\n\
                vec2 s=floor(uv),f=fract(uv),p;\n\
                float k=3.,d;\n\
                p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;\n\
                d=length(p);\n\
                k=min(d,k);\n\
                k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                return k*w;\n\
            }\n\
            \n\
            void main(){\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                vec3 finalColor=vec3(0);\n\
                float c = 0.0;\n\
                c+=snow(uv,30.)*.0;\n\
                c+=snow(uv,20.)*.0;\n\
                c+=snow(uv,15.)*.0;\n\
                c+=snow(uv,10.);\n\
                c+=snow(uv,8.);\n\
                c+=snow(uv,6.);\n\
                c+=snow(uv,5.);\n\
                finalColor=(vec3(c));\n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);\n\
                \n\
            }\n\
            ";
            return window.viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
                name: 'snowEffect',
                fragmentShader: fs
            }));
        }
    }
    // 雾天
    setFogEffect() {
        if (viewer) {
            let fragmentShaderSource =
                '\n\
                uniform sampler2D colorTexture;\n\
                     uniform sampler2D depthTexture;\n\
                     varying  vec2 v_textureCoordinates;\n\
                     void main(void)\n\
                     {\n\
                        vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n\
                         vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);\n\
                         float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n\
                         vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n\
                         float f=(depthcolor.r-0.22)/0.2;\n\
                         if(f<0.0) f=0.0;\n\
                         else if(f>1.0) f=0.6;\n\
                         gl_FragColor = mix(origcolor,fogcolor,f);\n\
                     }'

            return window.viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
                name: 'FogEffect',
                fragmentShader: fragmentShaderSource
            }));
        }
    }
    //天际线
    skyline() {
        let collection = window.viewer.scene.postProcessStages;

        let edgeDetection = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();

        let postProccessStage = new Cesium.PostProcessStage({
            name: 'czm_skylinetemp',
            fragmentShader: 'uniform sampler2D colorTexture;' +
                'uniform sampler2D depthTexture;' +

                'varying  vec2 v_textureCoordinates;' +

                'void main(void)' +
                '{' +
                'float depth = czm_readDepth(depthTexture, v_textureCoordinates);' +
                'vec4 color = texture2D(colorTexture, v_textureCoordinates);' +
                'if(depth<1.0 - 0.000001){' +
                'gl_FragColor = color;' +
                '}' +
                'else{' +
                'gl_FragColor = vec4(1.0,0.0,0.0,1.0);' +
                '}' +
                '}'
        });

        let postProccessStage1 = new Cesium.PostProcessStage({
            name: 'czm_skylinetemp1',
            fragmentShader: 'uniform sampler2D colorTexture;' +
                'uniform sampler2D redTexture;' +
                'uniform sampler2D silhouetteTexture;' +

                'varying  vec2 v_textureCoordinates;' +

                'void main(void)' +
                '{' +
                'vec4 redcolor=texture2D(redTexture, v_textureCoordinates);' +
                'vec4 silhouetteColor = texture2D(silhouetteTexture, v_textureCoordinates);' +
                'vec4 color = texture2D(colorTexture, v_textureCoordinates);' +
                'if(redcolor.r == 1.0){' +
                'gl_FragColor = mix(color, vec4(1.0,0.0,0.0,1.0), silhouetteColor.a);' +
                '}' +
                'else{' +
                'gl_FragColor = color;' +
                '}' +
                '}',
            uniforms: {
                redTexture: postProccessStage.name,
                silhouetteTexture: edgeDetection.name
            }
        });

        let postProccessStage2 = new Cesium.PostProcessStageComposite({
            name: 'czm_skyline',
            stages: [edgeDetection, postProccessStage, postProccessStage1],
            inputPreviousStageTexture: false,
            uniforms: edgeDetection.uniforms
        });

        collection.add(postProccessStage2);
    }
}
/**
 * 双击旋转，点击暂停
 * @param {Viewer} viewer
 * @return {*}
 * 
*/
class yangrotate {
    constructor(viewer) {
        this.viewer = window.viewer
    }
    // 根据国际天体参考系计算旋转矩阵
    icrf() {
        if (viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
            return ture;
        }
        console.log(viewer.camera.position);
        let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(viewer.clock.currentTime);
        if (icrfToFixed) {
            let camera = viewer.camera;
            let offset = Cesium.Cartesian3.clone(camera.position);
            let transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
            // 偏移相机，否则会场景旋转而地球不转
            camera.lookAtTransform(transform, offset);
        }
    }
    // 绑定事件
    bindEvent() {
        // 转动的速度设置
        viewer.clock.multiplier = 10 * 1000;
        // 初始化为单位矩阵
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        viewer.scene.postUpdate.addEventListener(this.icrf, this);
    }

    // 解除绑定
    unbindEvent() {
        viewer.clock.multiplier = 1;
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        viewer.scene.postUpdate.removeEventListener(this.icrf, this);
    }

    // 开始旋转
    start() {
        viewer.clock.shouldAnimate = true;
        this.unbindEvent();
        this.bindEvent();
        return this;
    }

    // 停止旋转
    stop() {
        this.unbindEvent();
        return this;
    }
}
/**
 * 二三维切换，openlaryer
 * @param {Viewer} viewer
 * @return {*}
 * 
*/
class OverMap {
    constructor(arg) {
        this.Cesium = Cesium;
        this.viewer = window.viewer
        this.L = arg.L
        this.optionsData = arg.options
        this.tileLayer = arg.layer
        this._container = null;
        this._miniMap = null;
        this._viewerMoving = false;
        this._miniMapMoving = false;
        this._userToggledDisplay = false;
        this._minimized = false;
        this.options = {
            position: 'bottomleft',
            toggleDisplay: true,
            zoomLevelOffset: -5,
            zoomLevelFixed: false,
            centerFixed: false,
            zoomControl: false,
            zoomAnimation: false,
            autoToggleDisplay: false,
            minimized: false,
            width: 150,
            height: 150,
            collapsedWidth: 19,
            collapsedHeight: 19,
            aimingRectOptions: {
                color: '#ff7800',
                weight: 1,
                interactive: false
            },
            shadowRectOptions: {
                color: '#000000',
                weight: 1,
                interactive: false,
                opacity: 0,
                fillOpacity: 0
            },
            strings: {
                hideText: '隐藏鹰眼',
                showText: '显示鹰眼'
            },
            mapOptions: {
                toggleDisplay: true,
                aimingRectOptions: {
                    color: "#ff1100",
                    weight: 3
                },
                shadowRectOptions: {
                    color: "#0000AA",
                    weight: 1,
                    opacity: 0,
                    fillOpacity: 0
                }
            }
        };
    }

    init() {
        this._container = this.optionsData.container;
        this.L.Util.setOptions(this, this.optionsData);

        this.options.aimingRectOptions.interactive = false;
        this.options.shadowRectOptions.interactive = false;

        this._initMap();
        this._showInitView();
    }

    updateAimingRect() {
        let _this = this;
        let rect = _this._getViewRange();
        _this._aimingRect.setBounds(rect);
    }

    _initMap() {
        let _this = this;

        this._container.style.width = this.options.width + 'px';
        this._container.style.height = this.options.height + 'px';

        _this.L.DomEvent.disableClickPropagation(_this._container);
        _this.L.DomEvent.on(_this._container, 'mousewheel', _this.L.DomEvent.stopPropagation);

        let mapOptions = {
            attributionControl: false,
            dragging: !_this.options.centerFixed,
            zoomControl: _this.options.zoomControl,
            zoomAnimation: _this.options.zoomAnimation,
            autoToggleDisplay: _this.options.autoToggleDisplay,
            touchZoom: _this.options.centerFixed ? 'center' : !_this._isZoomLevelFixed(),
            scrollWheelZoom: _this.options.centerFixed ? 'center' : !_this._isZoomLevelFixed(),
            doubleClickZoom: _this.options.centerFixed ? 'center' : !_this._isZoomLevelFixed(),
            boxZoom: !_this._isZoomLevelFixed(),
            crs: _this.L.CRS.EPSG3857,
            center: [30, 120],
            zoom: 1
        };
        mapOptions = _this.L.Util.extend(_this.options.mapOptions, mapOptions);

        _this._miniMap = new _this.L.Map(_this._container, mapOptions);

        let layer = this.tileLayer;
        _this._miniMap.addLayer(layer);

        _this._viewerMoving = true;
        _this._miniMapMoving = false;

        _this._userToggledDisplay = false;
        _this._minimized = false;

        if (this.options.toggleDisplay) {
            this._addToggleButton();
        }

        _this._miniMap.whenReady(_this.L.Util.bind(function () {
            let bounds = _this._getViewRange();
            _this._aimingRect = _this.L.rectangle(bounds, _this.options.aimingRectOptions).addTo(_this._miniMap);
            _this._shadowRect = _this.L.rectangle(bounds, _this.options.shadowRectOptions).addTo(_this._miniMap);

            let camera = _this.viewer.scene.camera;
            camera.moveEnd.addEventListener(function (e) {
                let rect = _this._getViewRange();
                if (!_this._miniMapMoving) {
                    _this._viewerMoving = true;
                    let zrect = _this._getZoomOutRange(rect);
                    if (zrect) {
                        _this._miniMap.fitBounds(zrect);
                        _this._setDisplay(_this._decideMinimized());
                    }
                } else {
                    _this._miniMapMoving = false;
                }
                if (rect)
                    _this._aimingRect.setBounds(rect);
            });
            camera.moveStart.addEventListener(function (e) {
                let rect = _this._getViewRange();
                if (rect)
                    _this._aimingRect.setBounds(rect);
            });

            _this._miniMap.on('movestart', _this._onMiniMapMoveStarted, _this);
            _this._miniMap.on('move', _this._onMiniMapMoving, _this);
            _this._miniMap.on('moveend', _this._onMiniMapMoved, _this);
        }, _this));

        return _this._container;
    }

    _addToggleButton() {
        this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
            '', this._toggleButtonInitialTitleText(), ('leaflet-control-minimap-toggle-display leaflet-control-minimap-toggle-display-' +
                this.options.position), this._container, this._toggleDisplayButtonClicked, this) : undefined;
        this._toggleDisplayButton.style.width = this.options.collapsedWidth + 'px';
        this._toggleDisplayButton.style.height = this.options.collapsedHeight + 'px';
    }

    _toggleButtonInitialTitleText() {
        if (this.options.minimized) {
            return this.options.strings.showText;
        } else {
            return this.options.strings.hideText;
        }
    }

    _createButton(body, title, className, container, fn, context) {
        let link = this.L.DomUtil.create('a', className, container);
        link.innerHtml = body;
        link.href = '#';
        link.title = title;

        let stop = this.L.DomEvent.stopPropagation;

        this.L.DomEvent
            .on(link, 'click', stop)
            .on(link, 'mousedown', stop)
            .on(link, 'dblclick', stop)
            .on(link, 'click', this.L.DomEvent.preventDefault)
            .on(link, 'click', fn, context);

        return link;
    }

    _toggleDisplayButtonClicked() {
        this._userToggledDisplay = true;
        if (!this._minimized) {
            this._minimize();
        } else {
            this._restore();
        }
    }

    _showInitView() {
        let rect = this._getViewRange();
        let zrect = this._getZoomOutRange(rect);
        if (zrect)
            this._miniMap.fitBounds(zrect);
    }

    _setDisplay(minimize) {
        if (minimize !== this._minimized) {
            if (!this._minimized) {
                this._minimize();
            } else {
                this._restore();
            }
        }
    }

    _minimize() {
        // hide the minimap
        if (this.options.toggleDisplay) {
            this._container.style.width = this.options.collapsedWidth + 'px';
            this._container.style.height = this.options.collapsedHeight + 'px';
            this._toggleDisplayButton.className += (' minimized-' + this.options.position);
            this._toggleDisplayButton.title = this.options.strings.showText;
        } else {
            this._container.style.display = 'none';
        }
        this._minimized = true;
        this._onToggle();
    }

    _restore() {
        if (this.options.toggleDisplay) {
            this._container.style.width = this.options.width + 'px';
            this._container.style.height = this.options.height + 'px';
            this._toggleDisplayButton.className = this._toggleDisplayButton.className
                .replace('minimized-' + this.options.position, '');
            this._toggleDisplayButton.title = this.options.strings.hideText;
        } else {
            this._container.style.display = 'block';
        }
        this._minimized = false;
        this._onToggle();
    }

    _onMiniMapMoveStarted(e) {
        if (!this.options.centerFixed) {
            let lastAimingRect = this._aimingRect.getBounds();
            let sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
            let ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
            this._lastAimingRectPosition = {
                sw: sw,
                ne: ne
            };
        }
    }

    _onMiniMapMoving(e) {
        if (!this.options.centerFixed) {
            if (!this._viewerMoving && this._lastAimingRectPosition) {
                this._shadowRect.setBounds(new this.L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw), this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
                this._shadowRect.setStyle({
                    opacity: 1,
                    fillOpacity: 0.3
                });
            }
        }
    }

    _onMiniMapMoved(e) {
        if (!this._viewerMoving) {
            this._miniMapMoving = true;

            let rect = this._shadowRect.getBounds();
            let west = rect.getWest();
            let east = rect.getEast();
            let north = rect.getNorth();
            let south = rect.getSouth();
            let destination = this.Cesium.Rectangle.fromDegrees(west, south, east, north);
            let orientation = {
                heading: this.Cesium.Math.toRadians(0),
                pitch: this.Cesium.Math.toRadians(-90),//-90
                roll: 0.0
            };
            this.viewer.scene.camera.setView({
                destination: destination,
                orientation: orientation
            });
            this._shadowRect.setStyle({
                opacity: 0,
                fillOpacity: 0
            });
        } else {
            this._viewerMoving = false;
        }
    }
    _isZoomLevelFixed() {
        let zoomLevelFixed = this.options.zoomLevelFixed;
        return this._isDefined(zoomLevelFixed) && this._isInteger(zoomLevelFixed);
    }
    _decideMinimized() {
        if (this._userToggledDisplay) {
            return this._minimized;
        }

        if (this.options.autoToggleDisplay) {
            let bounds = this._getViewRange();
            if (bounds.contains(this._miniMap.getBounds())) {
                return true;
            }
            return false;
        }

        return this._minimized;
    }
    _isInteger(value) {
        return typeof value === 'number';
    }
    _isDefined(value) {
        return typeof value !== 'undefined';
    }
    _onToggle() {
        this.L.Util.requestAnimFrame(function () {
            this.L.DomEvent.on(this._container, 'transitionend', this._fireToggleEvents, this);
            if (!this.L.Browser.any3d) {
                this.L.Util.requestAnimFrame(this._fireToggleEvents, this);
            }
        }, this);
    }
    _fireToggleEvents() {
        this.L.DomEvent.off(this._container, 'transitionend', this._fireToggleEvents, this);
    }
    _getViewRange() {
        let bounds = null;
        let viewer = this.viewer;
        let camera = viewer.scene.camera;
        let range = camera.computeViewRectangle();
        if (range) {
            let west = range.west / Math.PI * 180;
            let east = range.east / Math.PI * 180;
            let north = range.north / Math.PI * 180;
            let south = range.south / Math.PI * 180;
            bounds = new this.L.LatLngBounds(
                new this.L.LatLng(north, west),
                new this.L.LatLng(south, east)
            );
        }
        return bounds;
    }
    _getZoomOutRange(rect) {
        let bounds = null;
        if (rect) {
            let west = rect.getWest();
            let east = rect.getEast();
            let north = rect.getNorth();
            let south = rect.getSouth();
            let factor = 1.1;
            let xdis = Math.abs(east - west);
            let ydis = Math.abs(north - south);
            let xoff = xdis * (factor - 1) / 200.0;
            let yoff = ydis * (factor - 1) / 200.0;
            west -= xoff;
            east += xoff;
            north += yoff;
            south -= yoff;
            if (west < -180) {
                west = -180;
            }
            if (east > 180) {
                east = 180;
            }
            if (north > 90) {
                north = 90;
            }
            if (south < -90) {
                south = -90;
            }
            bounds = new this.L.LatLngBounds(
                new this.L.LatLng(north, west),
                new this.L.LatLng(south, east)
            );
        }
        return bounds;
    }
}
/**
 * 扩散圆，平面雷达扫描，场景泛光
 * @param {Viewer} viewer
 * @return {*}
 * 
*/
class yangScan {
    constructor() {
        this.viewer = window.viewer
    }
    /**
      * 场景泛光
     */
    setBloomLightScene() {
        if (viewer) {
            viewer.scene.postProcessStages.bloom.enabled = true
            viewer.scene.postProcessStages.bloom.uniforms.contrast = 119
            viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.4
            viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false
            viewer.scene.postProcessStages.bloom.uniforms.delta = 0.9
            viewer.scene.postProcessStages.bloom.uniforms.sigma = 3.78
            viewer.scene.postProcessStages.bloom.uniforms.stepSize = 5
            viewer.scene.postProcessStages.bloom.uniforms.isSelected = false
        }
    }
    setBloomstop() {
        viewer.scene.postProcessStages.bloom.enabled = false
    }
    // 添加动态圆扫描this._c_add_rotate_circle([120.952811,31.932272,1000],run_circle,1500,'Prevention_run_circle')
    circleScan(position, img, r, type) {
        var rotation = Cesium.Math.toRadians(30);
        function changeR1() {
            rotation -= 0.05;
            return rotation;
        }
        viewer.entities.add({
            id: type,// + this._m_uuid(),
            name: 'Red plane with black outline',
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            ellipse: {
                semiMinorAxis: r,
                semiMajorAxis: r,
                height: 200,
                stRotation: new Cesium.CallbackProperty(changeR1, false),
                material: new Cesium.ImageMaterialProperty({
                    image: img,
                    repeat: new Cesium.Cartesian2(1.0, 1.0),
                    transparent: true,
                }),
            },
        });
    }

    // 添加动态圆扩散let data = {id:this.drawGeometryList.length+1,name:'危险区域',position:cartesian,text:'',minR:100,maxR:100,deviationR:0}
    circleRun(item) {
        // 平面圆 动态变大
        var data = { id: 1, minR: item.minR, maxR: item.maxR, deviationR: item.deviationR };
        let r1 = data.minR
        function changeR1() {
            // 自动动态扩大
            r1 = r1 + data.deviationR; //deviationR为每次圆增加的大小
            if (r1 >= data.maxR) {
                r1 = data.minR;
            }
            return r1
        }
        var circle = viewer.entities.add({
            id: item.id,
            name: item.name,
            position: Cesium.Cartesian3.fromDegrees(item.position[0], item.position[1], item.position[2]),
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(changeR1, false),
                semiMajorAxis: new Cesium.CallbackProperty(changeR1, false),
                height: 20,
                material: new Cesium.ImageMaterialProperty({
                    image: item.img,
                    repeat: new Cesium.Cartesian2(1.0, 1.0),
                    transparent: true,
                    // 颜色逐渐透明
                    // color:new Cesium.CallbackProperty(function () {
                    //   if(data.minR != data.maxR){
                    //     var alp=1-r1/data.maxR;
                    //     return Cesium.Color.WHITE.withAlpha(alp)  //entity的颜色透明 并不影响材质，并且 entity也会透明哦
                    //   }
                    // },false)
                }),
            },
            label: {
                text: item.text,
                font: '500 15px Helvetica',
                showBackground: false,
                backgroundColor: Cesium.Color.fromCssColorString("#40d0da"),
                pixelOffset: new Cesium.Cartesian2(0, 0),
            },
        });
        return circle
    }

    // 添加扩散点
    pointRun(item) {
        let point = viewer.entities.add({
            id: item.draw_id,
            position: Cesium.Cartesian3.fromDegrees(item.positions[0], item.positions[1], item.positions[2]),
            show: true,
            ellipse: {
                semiMinorAxis: 50,
                semiMajorAxis: 50,
                height: 10,
                material: Cesium.Color.fromCssColorString("#07e0e8").withAlpha(0.8)
            },
            label: {
                text: item.dec,
                font: '500 15px Helvetica',
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString("#02a9ff"),
                pixelOffset: new Cesium.Cartesian2(0, -30),
            },
        });
        this.addCircleRipple({
            position: Cesium.Cartesian3.fromDegrees(item.positions[0], item.positions[1], item.positions[2]),
            deviationR: item.deviationR,//差值 差值也大 速度越快
            eachInterval: item.time,//两个圈的时间间隔
            imageUrl: item.img,
            maxR: item.maxR,
            type: item.draw_id
        });
        return point
    }

    addCircleRipple(data) {
        var r1 = 0, r2 = 0;
        function changeR1() { //这是callback，参数不能内传
            r1 = r1 + data.deviationR;
            if (r1 >= data.maxR) {
                r1 = 0;
            }
            return r1;
        }
        //第一个圆先跑
        viewer.entities.add({
            id: data.type,// + this._m_uuid(),
            description: "LIGHT_POINTS",
            position: data.position,
            show: true,
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(changeR1, false),
                semiMajorAxis: new Cesium.CallbackProperty(changeR1, false),
                height: 10,
                material: new Cesium.ImageMaterialProperty({
                    image: data.imageUrl,
                    repeat: Cesium.Cartesian2(1.0, 1.0),  //指定图像在每个方向上重复的次数,默认为Cesium.Cartesian2(1.0, 1.0),{Cartesian2}类型
                    transparent: true,// 默认为false，当图像具有透明性时设置为true（例如，当png具有透明部分时）
                    color: new Cesium.CallbackProperty(function () {
                        var alp = 1 - r1 / data.maxR;
                        return Cesium.Color.WHITE.withAlpha(alp)
                        //entity的颜色透明 并不影响材质，并且 entity也会透明
                    }, false)
                })
            }
        });
        //第二个圆开始跑
        setTimeout(() => {
            function changeR2() { //这是callback，参数不能内传
                r2 = r2 + data.deviationR;
                if (r2 >= data.maxR) {
                    r2 = 0;
                }
                return r2;
            }
            viewer.entities.add({
                id: data.type,
                description: "LIGHT_POINTS",
                position: data.position,
                show: true,
                ellipse: {
                    semiMinorAxis: new Cesium.CallbackProperty(changeR2, false),
                    semiMajorAxis: new Cesium.CallbackProperty(changeR2, false),
                    height: 10,
                    material: new Cesium.ImageMaterialProperty({
                        image: data.imageUrl,
                        repeat: Cesium.Cartesian2(1.0, 1.0),
                        transparent: true,
                        color: new Cesium.CallbackProperty(function () {
                            var alp = 1 - r2 / data.maxR;
                            return Cesium.Color.WHITE.withAlpha(alp)
                            //entity的颜色透明 并不影响材质，并且 entity也会透明
                        }, false)
                    })
                }
            });
        }, data.eachInterval)
    }

    /*
      添加雷达扫描线 地形遮挡开启
      cartographicCenter 扫描中心【new Cesium.Cartographic(Cesium.Math.toRadians(lon), Cesium.Math.toRadians(lat), 0);】
      radius  半径 米【1500】
      scanColor 扫描颜色【new Cesium.Color(1.0, 0.0, 0.0, 1)】
      duration 持续时间 毫秒【4000】
    */
    radarScan(position, radius, scanColor, duration) {
        viewer.scene.globe.depthTestAgainstTerrain = true;
        let cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(position[0]), Cesium.Math.toRadians(position[1]), position[2]);
        /* // 彩色纹理
        uniform sampler2D colorTexture;
        // 深度纹理
        uniform sampler2D depthTexture;
        // 纹理坐标
        varying vec2 v_textureCoordinates;
        // 扫描中心
        uniform vec4 u_scanCenterEC;
        // 扫描平面法线EC
        uniform vec3 u_scanPlaneNormalEC;
        // 扫描线法线EC
        uniform vec3 u_scanLineNormalEC;
        // 半径
        uniform float u_radius;
        // 扫描的颜色
        uniform vec4 u_scanColor;
        vec4 toEye( in vec2 uv, infloat depth) {
            vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
            vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
            posInCamera = posInCamera / posInCamera.w;
            return posInCamera;
        }
        bool isPointOnLineRight( in vec3 ptOnLine, invec3 lineNormal, invec3 testPt) {
            vec3 v01 = testPt - ptOnLine;
            normalize(v01);
            vec3 temp = cross(v01, lineNormal);
            float d = dot(temp, u_scanPlaneNormalEC);
            return d > 0.5;
        }
        vec3 pointProjectOnPlane( in vec3 planeNormal, invec3 planeOrigin, invec3 point) {
            vec3 v01 = point - planeOrigin;
            float d = dot(planeNormal, v01);
            return (point - planeNormal * d);
        }
        float distancePointToLine( in vec3 ptOnLine, invec3 lineNormal, invec3 testPt) {
            vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);
            return length(tempPt - ptOnLine);
        }
        float getDepth( in vec4 depth) {
            float z_window = czm_unpackDepth(depth);
            z_window = czm_reverseLogDepth(z_window);
            float n_range = czm_depthRange.near;
            float f_range = czm_depthRange.far;
            return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
        }
        void main() {
            // 得到釉色 = 结构二维(彩色纹理,纹理坐标)
            gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
            // 深度 = (釉色 = 结构二维(深度纹理,纹理坐标))
            float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
            // 视角 = (纹理坐标,深度)
            vec4 viewPos = toEye(v_textureCoordinates, depth);
            // 平面点投影 = (扫描平面法线,扫描中心,视角)
            vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
            // 差值
            float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
            // 直径 = 两个半径
            float twou_radius = u_radius * 2.0;
            if (dis < u_radius) {
                float f0 = 1.0 - abs(u_radius - dis) / u_radius;
                f0 = pow(f0, 64.0);
                vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;
                float f = 0.0;
                if (isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz)) {
                    float dis1 = length(prjOnPlane.xyz - lineEndPt);
                    f = abs(twou_radius - dis1) / twou_radius;
                    f = pow(f, 3.0);
                }
                gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);
            }
        } */
        var ScanSegmentShader =
            "uniform sampler2D colorTexture;\n" +
            "uniform sampler2D depthTexture;\n" +
            "varying vec2 v_textureCoordinates;\n" +
            "uniform vec4 u_scanCenterEC;\n" +
            "uniform vec3 u_scanPlaneNormalEC;\n" +
            "uniform vec3 u_scanLineNormalEC;\n" +
            "uniform float u_radius;\n" +
            "uniform vec4 u_scanColor;\n" +

            "vec4 toEye(in vec2 uv, in float depth)\n" +
            " {\n" +
            " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
            " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
            " posInCamera =posInCamera / posInCamera.w;\n" +
            " return posInCamera;\n" +
            " }\n" +

            "bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
            "{\n" +
            "vec3 v01 = testPt - ptOnLine;\n" +
            "normalize(v01);\n" +
            "vec3 temp = cross(v01, lineNormal);\n" +
            "float d = dot(temp, u_scanPlaneNormalEC);\n" +
            "return d > 0.5;\n" +
            "}\n" +

            "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
            "{\n" +
            "vec3 v01 = point -planeOrigin;\n" +
            "float d = dot(planeNormal, v01) ;\n" +
            "return (point - planeNormal * d);\n" +
            "}\n" +

            "float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
            "{\n" +
            "vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n" +
            "return length(tempPt - ptOnLine);\n" +
            "}\n" +

            "float getDepth(in vec4 depth)\n" +
            "{\n" +
            "float z_window = czm_unpackDepth(depth);\n" +
            "z_window = czm_reverseLogDepth(z_window);\n" +
            "float n_range = czm_depthRange.near;\n" +
            "float f_range = czm_depthRange.far;\n" +
            "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
            "}\n" +

            "void main()\n" +
            "{\n" +
            "gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +
            "float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +
            "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
            "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
            "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
            "float twou_radius = u_radius * 2.0;\n" +
            "if(dis < u_radius)\n" +
            "{\n" +
            "float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n" +
            "f0 = pow(f0, 64.0);\n" +
            "vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n" +
            "float f = 0.0;\n" +
            "if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n" +
            "{\n" +
            "float dis1= length(prjOnPlane.xyz - lineEndPt);\n" +
            "f = abs(twou_radius -dis1) / twou_radius;\n" +
            "f = pow(f, 3.0);\n" +
            "}\n" +
            "gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);\n" +
            "}\n" +
            "}\n";

        var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

        var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

        var _CartographicCenter2 = new Cesium.Cartographic(cartographicCenter.longitude + Cesium.Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
        var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
        var _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
        var _RotateQ = new Cesium.Quaternion();
        var _RotateM = new Cesium.Matrix3();

        var _time = (new Date()).getTime();

        var _scratchCartesian4Center = new Cesium.Cartesian4();
        var _scratchCartesian4Center1 = new Cesium.Cartesian4();
        var _scratchCartesian4Center2 = new Cesium.Cartesian4();
        var _scratchCartesian3Normal = new Cesium.Cartesian3();
        var _scratchCartesian3Normal1 = new Cesium.Cartesian3();

        var ScanPostStage = new Cesium.PostProcessStage({
            fragmentShader: ScanSegmentShader,
            uniforms: {
                u_scanCenterEC: function () {
                    return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                },
                u_scanPlaneNormalEC: function () {
                    var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                    return _scratchCartesian3Normal;
                },
                u_radius: radius,
                u_scanLineNormalEC: function () {
                    var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    var temp2 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);

                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

                    _scratchCartesian3Normal1.x = temp2.x - temp.x;
                    _scratchCartesian3Normal1.y = temp2.y - temp.y;
                    _scratchCartesian3Normal1.z = temp2.z - temp.z;

                    var tempTime = (((new Date()).getTime() - _time) % duration) / duration;
                    Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ);
                    Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
                    Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    return _scratchCartesian3Normal1;
                },
                u_scanColor: scanColor
            }
        });
        viewer.scene.postProcessStages.add(ScanPostStage);
    }

}

/**
 * 雷达遮罩扫描
 * @param {Viewer} viewer
 * @param {Cartesian3} position 经纬度
 * @param {String} id 
 * @param {number} shortwaveRange 半径
 * @return {*}
 * 
*/
class yangTrack {
    constructor(val) {
        this.viewer = window.viewer;
        this.id = val.id;
        this.shortwaveRange = val.shortwaveRange;
        this.longitude = val.position[0],
            this.latitude = val.position[1],
            this.position = Cesium.Cartesian3.fromDegrees(
                val.position[0],
                val.position[1],
            );
        this.heading = 0;
        this.positionArr = this.calcPoints(
            val.position[0],
            val.position[1],
            val.shortwaveRange,
            0
        ) //储存脏数据
        this.addEntities()
    }
    addEntities() {
        let entity = this.viewer.entities.add({
            id: this.id,
            position: this.position,
            wall: {
                positions: new Cesium.CallbackProperty(() => {
                    return Cesium.Cartesian3.fromDegreesArrayHeights(this.positionArr);
                }, false),
                material: new Cesium.Color.fromCssColorString("#00dcff82"),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                    0.0,
                    10.5e6
                ),
            },
            ellipsoid: {
                radii: new Cesium.Cartesian3(
                    this.shortwaveRange,
                    this.shortwaveRange,
                    this.shortwaveRange
                ),
                maximumCone: Cesium.Math.toRadians(90),
                material: new Cesium.Color.fromCssColorString("#00dcff82"),
                outline: true,
                outlineColor: new Cesium.Color.fromCssColorString("#00dcff82"),
                outlineWidth: 1,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                    0.0,
                    10.5e6
                ),
            },
        });
        this.addPostRender()
    }
    addPostRender() {
        this.viewer.clock.onTick.addEventListener(() => {
            this.heading += 3.0;//可调节转动速度
            this.positionArr = this.calcPoints(
                this.longitude,
                this.latitude,
                this.shortwaveRange,
                this.heading
            );
        });
    }
    calcPoints(x1, y1, radius, heading) {
        var m = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(x1, y1)
        );
        var rx = radius * Math.cos((heading * Math.PI) / 180.0);
        var ry = radius * Math.sin((heading * Math.PI) / 180.0);
        var translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
        var d = Cesium.Matrix4.multiplyByPoint(
            m,
            translation,
            new Cesium.Cartesian3()
        );
        var c = Cesium.Cartographic.fromCartesian(d);
        var x2 = Cesium.Math.toDegrees(c.longitude);
        var y2 = Cesium.Math.toDegrees(c.latitude);
        return this.computeCirclularFlight(x1, y1, x2, y2, 0, 90);
    }
    computeCirclularFlight(x1, y1, x2, y2, fx, angle) {
        let positionArr = [];
        positionArr.push(x1);
        positionArr.push(y1);
        positionArr.push(0);
        var radius = Cesium.Cartesian3.distance(
            Cesium.Cartesian3.fromDegrees(x1, y1),
            Cesium.Cartesian3.fromDegrees(x2, y2)
        );
        for (let i = fx; i <= fx + angle; i++) {
            let h = radius * Math.sin((i * Math.PI) / 180.0);
            let r = Math.cos((i * Math.PI) / 180.0);
            let x = (x2 - x1) * r + x1;
            let y = (y2 - y1) * r + y1;
            positionArr.push(x);
            positionArr.push(y);
            positionArr.push(h);
        }
        return positionArr;
    }

}
/**鼠标拖拽
 * @param {Viewer} viewer
 * 
*/
class yangDrag {
    constructor(val) {
        this.viewer = val.viewer,
            this.leftDownFlag = false
        this.pick = null;//储存实体
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.handlers()
    }
    handlers() {
        this.leftDownAction()
        this.mouseMoveAction()
        this.leftUpAction()
    }
    leftDownAction() {
        let _this = this
        _this.handler.setInputAction(function (movement) {
            let pick = _this.viewer.scene.pick(movement.position);
            if (Cesium.defined(pick) && (pick.id.id)) {
                _this.pick = pick
                _this.leftDownFlag = true;
                _this.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }

    mouseMoveAction() {
        let _this = this
        _this.handler.setInputAction(function (movement) {
            if (_this.leftDownFlag === true && _this.pick != null) {
                let ray = _this.viewer.camera.getPickRay(movement.endPosition);
                let cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
                _this.pick.id.position = cartesian;//此处根据具体entity来处理，也可能是pointDraged.id.position=cartesian;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    leftUpAction() {
        let _this = this
        _this.handler.setInputAction(function (movement) {
            if (_this.leftDownFlag === true && _this.pick != null) {
                _this.leftDownFlag = false;
                _this.pointDraged = null;
                _this.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
            }
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
    //清楚鼠标事件
    updataAction() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
}
/**淹没分析
 * @param {Viewer} viewer
 * 
*/
class yangFlood {
    init() {
        viewer.scene.globe.depthTestAgainstTerrain = true;
        let tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
            url: '../../static/cd-new/tileset.json'
        }));
        tileset.readyPromise.then(function (tileset) {
            viewer.scene.primitives.add(tileset);
            viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
            tileset.style = new Cesium.Cesium3DTileStyle({
                color: {
                    conditions: [
                        ["true", "color('cyan')"]
                    ]
                }
            })
        })

    }
    //淹没分析
    flood(currentHeight, maxHeight, times) {
        console.log("大：" + maxHeight);
        console.log("小：" + currentHeight);
        console.log("时间" + times);
        console.log("范围：" + adapCoordi);
        viewer.scene.primitives.remove(tileset1);
        if (Cesium.defined(adapCoordi)) {
        } else {
            alert("请先绘制淹没范围");
            return;
        }
        var speed = (maxHeight - currentHeight) / times;
        //entity方式创建.
        let entity1 = viewer.entities.add({
            id: "floodEntity",
            polygon: {
                //hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adapCoordi),
                hierarchy: adapCoordi,
                closeTop: true,
                closeBottom: true,
                fill: true,
                //获取或设置分类类型属性，指定此多边形在地面上时是否对地形、3D瓷砖或两者进行分类。
                classificationType: Cesium.ClassificationType.BOTH,
                //material: Cesium.Color.fromAlpha(Cesium.Color.fromCssColorString("#7EA4B3"), 0.9),
                material:
                    new Cesium.ImageMaterialProperty({
                        image: '../icons/normal.jpg',
                        repeat: Cesium.Cartesian2(1.0, 1.0), // 不重复
                        transparent: true, // 启用png透明
                        color: Cesium.Color.fromAlpha(Cesium.Color.fromCssColorString("#7EA4B3"), 0.9),
                    }),
                perPositionHeight: true,
                //一个属性，其值由回调函数延迟评估。time, result
                extrudedHeight: 0,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
        });
        //设置高度随时间变化
        let setFlood = setInterval(() => {
            if (currentHeight < maxHeight) {
                currentHeight += speed / 25;
                entity1.polygon.extrudedHeight = new Cesium.CallbackProperty(function () {
                    return currentHeight;
                });
            }
            else {
                clearInterval(setFlood);
            }
            console.log(currentHeight);
        }, 1000 / 30);
    }
    //绘制多边形
    drawPolygon() {
        let actPoints = [];
        let floatPoint;
        let dynamicShape;
        let handle = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        //左键
        handle.setInputAction(function (movement) {
            var position = viewer.scene.pickPosition(movement.position);
            if (Cesium.defined(position)) {
                actPoints.push(position);
                if (actPoints.length < 2) {
                    actPoints.push(position);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //右键
        handle.setInputAction(function (movement) {
            var position = viewer.scene.pickPosition(movement.position);
            if (Cesium.defined(position)) {
                actPoints.push(position);
                floatPoint = actPoints;
                viewer.entities.removeAll();
                actPoints = [];
                createPolygon(floatPoint);
                adapCoordi = floatPoint;
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); // LEFT_DOUBLE_CLICK、RIGHT_CLICK
        //移动
        handle.setInputAction(function (movement) {
            if (actPoints.length > 0) {
                var position = viewer.scene.pickPosition(movement.endPosition);
                if (Cesium.defined(position)) {
                    actPoints.pop();
                    actPoints.push(position);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        viewer.entities.add({
            id: "tempPolyline",
            polyline: {
                positions: new Cesium.CallbackProperty(function () {
                    return actPoints;
                }, false),
                width: 2,
                extrudedHeight: 100,
                material: Cesium.Color.RED.withAlpha(1),
            }
        });

        //创建多边形
        function createPolygon(points) {
            //primitive方式创建.可以制作出水波纹效果。adapCoordi
            let waterPrimitive = new Cesium.Primitive({
                allowPicking: false,
                asynchronous: false,
                geometryInstances: new Cesium.GeometryInstance({
                    id: 'floodGeoInstance',
                    geometry: new Cesium.PolygonGeometry({
                        polygonHierarchy: new Cesium.PolygonHierarchy(points),
                        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                        extrudedHeight: 1,
                        height: 0,
                    }),
                }),
                appearance: new Cesium.EllipsoidSurfaceAppearance({
                    //当为 true 时，几何体应位于椭圆体的表面上,不是在其上方的恒定高度
                    aboveGroud: true,
                    material: new Cesium.Material({
                        fabric: {
                            type: 'Water',
                            uniforms: {
                                blendColor: new Cesium.Color(0, 0, 1, 0.3),
                                normalMap: '../icons/waterNormals.jpg',
                                //频率速度设置
                                frequency: 200,
                                animationSpeed: 0.01,
                                amplitude: 10
                            }
                        },
                    })
                })
            });
            tileset1 = viewer.scene.primitives.add(waterPrimitive);
        }
    }
}
//广告牌
class yangboard {
    /**
 * 用于添加poi的icon和label的函数
 * @param {*} lon ：经度
 * @param {*} lat ：纬度
 * @param {*} name ：标签内容
 * @param {*} color ：底部圆和横线的颜色
 * @param {*} url ：icon地址
 */
    poiIconLabelAdd(lon, lat, name, color, url) {
        viewer.entities.add({
            name: name,
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 300),
            // 图标
            billboard: {
                image: url,
                width: 50,
                height: 50,
            },
            label: {
                //文字标签
                text: name,
                font: '20px sans-serif',
                style: Cesium.LabelStyle.FILL,
                // 对齐方式(水平和竖直)
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(20, -2),
                showBackground: true,
                backgroundColor: new Cesium.Color.fromBytes(0, 70, 24),
            },
        });

        // 先画线后画点，防止线压盖点
        let linePositions = [];
        linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, 5));
        linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, 300));
        viewer.entities.add({
            polyline: {
                positions: linePositions,
                width: 1.5,
                material: color,
            }
        })

        // 画点
        viewer.entities.add({
            // 给初始点位设置一定的离地高度，否者会被压盖
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 5),
            point: {
                color: color,
                pixelSize: 15,
            }
        })
    }

}
//水面波浪
class yangWater {
    //绘制水面波浪效果
    drawWater() {
        viewer.scene.globe.depthTestAgainstTerrain = false;
        var waterFace = [
            130.0, 30.0, 0,
            150.0, 30.0, 0,
            150.0, 10.0, 0,
            130.0, 10.0, 0];
        var waterPrimitive = new Cesium.Primitive({
            show: true,// 默认隐藏
            allowPicking: false,
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(waterFace)),
                    //extrudedHeight: 0,//注释掉此属性可以只显示水面
                    perPositionHeight: true//注释掉此属性水面就贴地了
                })
            }),
            // 可以设置内置的水面shader
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: 'Water',
                        uniforms: {
                            baseWaterColor: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
                            //blendColor: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
                            //specularMap: 'normal.jpg',
                            normalMap: 'normal.jpg',
                            frequency: 1000.0,
                            animationSpeed: 0.01,
                            amplitude: 10.0
                        }
                    }
                }),
                fragmentShaderSource: 'varying vec3 v_positionMC;\n' +
                    'varying vec3 v_positionEC;\n' +
                    'varying vec2 v_st;\n' +
                    'void main()\n' +
                    '{\n' +
                    'czm_materialInput materialInput;\n' +
                    'vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n' +
                    '#ifdef FACE_FORWARD\n' +
                    'normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n' +
                    '#endif\n' +
                    'materialInput.s = v_st.s;\n' +
                    'materialInput.st = v_st;\n' +
                    'materialInput.str = vec3(v_st, 0.0);\n' +
                    'materialInput.normalEC = normalEC;\n' +
                    'materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n' +
                    'vec3 positionToEyeEC = -v_positionEC;\n' +
                    'materialInput.positionToEyeEC = positionToEyeEC;\n' +
                    'czm_material material = czm_getMaterial(materialInput);\n' +
                    '#ifdef FLAT\n' +
                    'gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n' +
                    '#else\n' +
                    'gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);\n' +
                    'gl_FragColor.a=0.85;\n' +
                    '#endif\n' +
                    '}\n'
                //重写shader，修改水面的透明度
            })
        });
        viewer.scene.primitives.add(waterPrimitive);
        // 流动水面效果
        viewer.scene.primitives.add(
            new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.RectangleGeometry({
                        rectangle: Cesium.Rectangle.fromDegrees(
                            110.95, 20.48,
                            118.99, 28.52
                        ),
                        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    }),
                }),
                appearance: new Cesium.EllipsoidSurfaceAppearance({
                    material: new Cesium.Material({
                        fabric: {
                            type: "Water",
                            uniforms: {
                                baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5),
                                normalMap: '../icons/waterNormals.jpg',
                                frequency: 1000.0,
                                animationSpeed: 0.1,
                                amplitude: 10,
                                specularIntensity: 10
                            }
                        }
                    })
                }),
            })
        );

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(140, 20, 6000000.0),
            orientation: {
                heading: Cesium.Math.toRadians(0.0), //默认朝北0度，顺时针方向，东是90度
                pitch: Cesium.Math.toRadians(-90), //默认朝下看-90,0为水平看，
                roll: Cesium.Math.toRadians(0) //默认0
            }
        });

    }
}
export { yangweather, yangrotate, OverMap, yangScan, yangTrack, yangDrag, yangFlood, yangWater }