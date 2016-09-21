var renderer, scene, camera, ww, wh, particles;

ww = window.innerWidth,
wh = window.innerHeight;

var centerVector = new THREE.Vector3(0, 0, 0);
var previousTime = 0;

var getImageData = function(image) {

	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;

	var ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0);

	return ctx.getImageData(0, 0, image.width, image.height);
}

var drawTheMap = function() {

	var geometry = new THREE.Geometry();
	var material = new THREE.PointsMaterial({
		size: 5,//顆粒大小
		color: 0xffffff,//color
		sizeAttenuation: false
	});
	for (var y = 0, y2 = imagedata.height; y < y2; y += 2) {
		for (var x = 0, x2 = imagedata.width; x < x2; x += 2) {
			if (imagedata.data[(x * 4 + y * 4 * imagedata.width) + 3] > 128) {

				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 1000 - 500;
				vertex.y = Math.random() * 1000 - 500;
				vertex.z = -Math.random() * 500;

				vertex.destination = {
					x: x - imagedata.width / 2,
					y: -y + imagedata.height / 2,
					z: 0
				};

				vertex.speed = Math.random() / 80 + 0.035;//地圖成形時間

				geometry.vertices.push(vertex);
			}
		}
	}
	particles = new THREE.Points(geometry, material);

	scene.add(particles);

	requestAnimationFrame(render);
};

var init = function() {
	THREE.ImageUtils.crossOrigin = '';
	// width = document.getElementById('canvas3d').clientWidth;//獲得畫布「canvas3d」的寬
    // height = document.getElementById('canvas3d').clientHeight;//獲得畫布「canvas3d」的高
	renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById("map"),
		antialias: true,//antialias:true/false是否開啟反鋸齒
		alpha:true,
		maxLights:1,
        precision:"highp",//precision:highp/mediump/lowp著色精準度選擇
        alpha:true,//alpha:true/false是否可以设置背景色透明
        premultipliedAlpha:false,//?
        stencil:false,//?
        preserveDrawingBuffer:true,//preserveDrawingBuffer:true/false是否保存繪圖緩衝
        maxLights:1//maxLights:最大燈光數
	});
	renderer.setSize(ww, wh);//指定渲染器的高寬（和畫布框大小一致）
	renderer.setClearColor(0x000000,0);//設置canvas背景色(clearColor)和背景色透明度（clearAlpha）
	renderer.globalAlpha=0.2;

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(50, ww / wh, 0.1, 10000);
	camera.position.set(-100, 0, 220);
	camera.lookAt(centerVector);
	scene.add(camera);

	texture = THREE.ImageUtils.loadTexture("http://mamboleoo.be/lab/transparentMap.png", undefined, function() {
		imagedata = getImageData(texture.image);
		drawTheMap();
	});
  window.addEventListener('resize', onResize, false);

};

var onResize = function(){
	ww = window.innerWidth;
	wh = window.innerHeight;
	renderer.setSize(ww, wh);
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
};

var render = function(a) {

	requestAnimationFrame(render);

	for (var i = 0, j = particles.geometry.vertices.length; i < j; i++) {
		var particle = particles.geometry.vertices[i];
		particle.x += (particle.destination.x - particle.x) * particle.speed;
		particle.y += (particle.destination.y - particle.y) * particle.speed;
		particle.z += (particle.destination.z - particle.z) * particle.speed;
	}

	if(a-previousTime>500){
		var index = Math.floor(Math.random()*particles.geometry.vertices.length);
		var particle1 = particles.geometry.vertices[index];
		var particle2 = particles.geometry.vertices[particles.geometry.vertices.length-index];
		TweenMax.to(particle1, Math.random()*2+1,{x:particle2.x, y:particle2.y, ease:Power2.easeInOut});
		TweenMax.to(particle2, Math.random()*2+1,{x:particle1.x, y:particle1.y, ease:Power2.easeInOut});
		previousTime = a;
	}

	particles.geometry.verticesNeedUpdate = true;
	camera.position.x = Math.sin(a / 5000) * 25;//視角,旋轉角度
	camera.lookAt(centerVector);

	renderer.render(scene, camera);
};

init();