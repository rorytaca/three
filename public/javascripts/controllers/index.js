if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;
var camera, scene, renderer, light;
var water, sphere;
var hemiLight, hemiLightHelper;
var stars, starGeo;

init();
animate();

function init() {
    container = document.getElementById( 'three-js-mount' );
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
    var waterGeometry = new THREE.PlaneBufferGeometry(10000,10000);
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

    // LIGHTS
    hemiLight = new THREE.HemisphereLight( 0x33aaff, 0x99aaff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add(hemiLight);
    // hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    // scene.add( hemiLightHelper );

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

    // uniforms.topColor.value.copy( hemiLight.color );
    scene.fog.color.copy( new THREE.Color(0x7867e0) );
    var skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 32);
    var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
    
    // var skyMat = new THREE.MeshPhongMaterial({ 
    //     map: skyTexture,
    // });
    var sky = new THREE.Mesh( skyGeo, skyMat );
    sky.material.side = THREE.BackSide;
    scene.add( sky );


    var starMat = new THREE.PointCloudMaterial({
      color: 0x99aaff
    });

    starGeo = new THREE.Geometry();
    var x, y, z;

    for (var i = 0; i < 2000; i++) {
      x = (Math.random() * 800) - 400;
      y = (Math.random() * 800) - 400;
      z = (Math.random() * 800) - 400;

      starGeo.vertices.push(new THREE.Vector3(x, y, z));
    };
    stars = new THREE.PointCloud(starGeo, starMat);
    scene.add(stars);

    // // Skybox
    // var sky = new THREE.Sky();
    // sky.scale.setScalar( 10000 );
    // scene.add(sky);

    // console.log(sky);

    // var uniforms = sky.material.uniforms;
    // uniforms.turbidity.value = 50;
    // uniforms.rayleigh.value = 4;
    // uniforms.luminance.value = 1;
    // uniforms.mieCoefficient.value = 0.005;
    // uniforms.mieDirectionalG.value = 0.85;

    // var parameters = {
    //     distance: 400,
    //     inclination: 0.49,
    //     azimuth: 0.25
    // };

    // var cubeCamera = new THREE.CubeCamera( 1, 20000, 256 );
    // cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    // function updateSun() {
    //     var theta = Math.PI * ( parameters.inclination - 0.5 );
    //     var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
    //     light.position.x = parameters.distance * Math.cos( phi );
    //     light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
    //     light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
    //     sky.material.uniforms.sunPosition.value = light.position.copy( light.position );
    //     water.material.uniforms.sunDirection.value.copy( light.position ).normalize();
    //     cubeCamera.update( renderer, scene );
    // }

    // updateSun();
    //
    // var geometry = new THREE.IcosahedronBufferGeometry( 20, 1 );
    // var count = geometry.attributes.position.count;
    // var colors = [];
    // var color = new THREE.Color();
    // for ( var i = 0; i < count; i += 3 ) {
    //     color.setHex( Math.random() * 0xffffff );
    //     colors.push( color.r, color.g, color.b );
    //     colors.push( color.r, color.g, color.b );
    //     colors.push( color.r, color.g, color.b );
    // }
    // geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    // var material = new THREE.MeshStandardMaterial( {
    //     vertexColors: THREE.VertexColors,
    //     roughness: 0.0,
    //     flatShading: true,
    //     envMap: cubeCamera.renderTarget.texture,
    //     side: THREE.DoubleSide
    // } );
    // sphere = new THREE.Mesh( geometry, material );
    // scene.add( sphere );
    //
    // controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.maxPolarAngle = Math.PI * 0.495;
    // controls.target.set( 0, 10, 0 );
    // controls.minDistance = 40.0;
    // controls.maxDistance = 200.0;
    // camera.lookAt( controls.target );
    //
    stats = new Stats();
    container.appendChild( stats.dom );
    // GUI
    // var gui = new dat.GUI();
    // var folder = gui.addFolder( 'Sky' );
    // folder.add( parameters, 'inclination', 0, 0.5, 0.0001 ).onChange( updateSun );
    // folder.add( parameters, 'azimuth', 0, 1, 0.0001 ).onChange( updateSun );
    // folder.open();
    // var uniforms = water.material.uniforms;
    // var folder = gui.addFolder( 'Water' );
    // folder.add( uniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
    // folder.add( uniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    // folder.add( uniforms.alpha, 'value', 0.9, 1, .001 ).name( 'alpha' );
    // folder.open();
    //
    window.addEventListener( 'resize', onWindowResize, false );
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

    // sphere.position.y = Math.sin( time ) * 20 + 5;
    // sphere.rotation.x = time * 0.5;
    // sphere.rotation.z = time * 0.51;
    starGeo.vertices.forEach(function(particle){
        particle.y -= 5;
        particle.x += Math.random() * 4;
    // particle.add(new THREE.Vector3(particle.x, particle.y, particle.z));
    });

    starGeo.verticesNeedUpdate = true;

    water.material.uniforms.time.value += .3 / 60.0;
    renderer.render( scene, camera );
}