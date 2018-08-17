(function() {

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var container, stats;
    var camera, scene, renderer;
    var water, stars, starGeo, shootingStars, shootingStarGeo;

    var cameraState = "middle", 
        cameraLock = false;

    init();
    animate();

    function init() {
        container = document.getElementById('three-js-mount');
        //
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );
        //
        scene = new THREE.Scene();
        scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
        scene.fog = new THREE.Fog(scene.background, 1000, 2000);
        //
        camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
        camera.position.set(30,30,100);
        //
        light = new THREE.DirectionalLight(0xffffff,0.8);
        scene.add(light);
        // Water
        var waterGeometry = new THREE.PlaneBufferGeometry(5000,5000);
        water = new THREE.Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( 'images/waternormals.jpg', function ( texture ) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                alpha: 1,
                sunDirection: light.position.clone().normalize(),
                sunColor: 0x33aaff,
                waterColor: 0x8e80e5,
                distortionScale:  10,
                fog: true
            }
        );

        water.rotation.x = - Math.PI / 2;
        scene.add(water);

        // SKYDOME
        var vertexShader = document.getElementById('vertexShader').textContent;
        var fragmentShader = document.getElementById('fragmentShader').textContent;
        var uniforms = {
            topColor:    {value: new THREE.Color(0x0b0011)},
            bottomColor: {value: new THREE.Color(0x7867e0)},
            offset:      {value: 33},
            exponent:    {value: 0.7}
        }; 
        var skyTexture =  new THREE.TextureLoader().load( 'images/star3.jpg');

        scene.fog.color.copy(new THREE.Color(0x7867e0));
        var skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 32);
        var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
        
        var sky = new THREE.Mesh( skyGeo, skyMat );
        sky.material.side = THREE.BackSide;
        scene.add( sky );

        var starMat = new THREE.PointsMaterial({ 
            size: Math.random() * (5 - 2) + 2,
            transparent: true,
            blending: THREE.AdditiveBlending,
            map: generateSprite()
        });

        starGeo = new THREE.Geometry();

        for (var i = 0; i < 5000; i++) {
            var star = new THREE.Vector3();
            star.x = THREE.Math.randFloatSpread(1000);
            star.y = THREE.Math.randFloat(100,2000);
            star.z = THREE.Math.randFloatSpread(2000);

          starGeo.vertices.push(star);
        };
        stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);


        var shootingStarMat = new THREE.PointsMaterial({ 
            // color: 0x99aaff,
            size: Math.random() * (4 - 2) + 2,
            transparent: true,
            blending: THREE.AdditiveBlending,
            map: generateSprite()
        });

        shootingStarGeo = new THREE.Geometry();

        for (var i = 0; i < 1250; i++) {
            var star = new THREE.Vector3();
            star.x = THREE.Math.randFloatSpread(1000);
            star.y = THREE.Math.randFloat(50,600);
            star.z = THREE.Math.randFloat(-500,000);
            shootingStarGeo.vertices.push(star);
        };

        shootingStars = new THREE.Points(shootingStarGeo, shootingStarMat);
        scene.add(shootingStars);
        
        stats = new Stats();
        // container.appendChild( stats.dom );

        window.addEventListener( 'resize', onWindowResize, false );
    }

    function generateSprite() {
        var canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        var context = canvas.getContext('2d');
        var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(250,5,55,1)');
        gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
    }
    function render() {
        var time = performance.now() * 0.001;
        shootingStarGeo.vertices.forEach(function(particle){
            particle.x += 1/4;
            particle.y += 1/9;
            particle.z += 1/4;

            if (particle.y > 600) {
                particle.y = 33;
                particle.x = THREE.Math.randFloatSpread(1000);
                particle.z = THREE.Math.randFloat(-500,000);
            }
        });

        shootingStarGeo.verticesNeedUpdate = true;

        if (cameraState == "up" && camera.rotation.x <= Math.PI / 3) {
           camera.rotation.x  += .035;
           water.rotation.x = - Math.PI / 2;
        }
        if (cameraState == "middle") {
            if (water.rotation.x >= - Math.PI / 2) {
                water.rotation.x -= .02;
            }
            if (camera.rotation.x != 0) {
                var dir = camera.rotation.x > 0 ? -1 : 1;
                camera.rotation.x += .035*dir; 
            }
            if (Math.abs(camera.rotation.x) <= .035) camera.rotation.x = 0;
        } 
        if (cameraState == "down" && water.rotation.x <= - Math.PI / 4) {
           water.rotation.x += .02;
        } 

        water.material.uniforms.time.value += .3 / 60.0;
        renderer.render( scene, camera );
    }

    window.addEventListener('wheel', function(e) {
      if (e.deltaY < 0) {
        if (!cameraLock) {
            cameraLock = true;
            switch(cameraState) {
                case "up":
                    cameraState = "up";
                    break;
                case "middle":
                    cameraState = "up";
                    break;
                case "down":
                    cameraState = "middle";
                    break;
            }
            setTimeout(function() {
                cameraLock = false;
            }, 1000);
        }
      }
      if (e.deltaY > 0) {
        if (!cameraLock) {
            cameraLock = true;
            switch(cameraState) {
                case "up":
                    cameraState = "middle";
                    break;
                case "middle":
                    cameraState = "down";
                    break;
                case "down":
                    cameraState = "down";
                    break;
            }
            setTimeout(function() {
                cameraLock = false;
            }, 1000);
        }
      }
    });
})();