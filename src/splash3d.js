(function(){
  const canvas = document.getElementById('splash');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  function resize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#F9F9FC');
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.z = 4;
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1,1,2);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff,0.5));
  const texture = new THREE.TextureLoader().load('splash.png');
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2,2),
    new THREE.MeshBasicMaterial({ map:texture, transparent:true, opacity:0 })
  );
  scene.add(plane);
  resize();
  let start = performance.now();
  const TOTAL_DURATION = 4500;
  const FADE_OUT_MS = 1000;
  let fadeStart = null;
  function animate(ts){
    const elapsed = ts - start;
    plane.rotation.y += 0.01;
    if(elapsed >= TOTAL_DURATION && !fadeStart){
      fadeStart = ts;
      document.getElementById('done-sound').play().catch(()=>{});
    }
    let opacity = plane.material.opacity;
    if(fadeStart){
      const f = ts - fadeStart;
      opacity = Math.max(0, 1 - f/FADE_OUT_MS);
      plane.material.opacity = opacity;
      if(opacity <= 0){
        canvas.style.display='none';
        window.dispatchEvent(new Event('splashDone'));
        return;
      }
    }else{
      plane.material.opacity = Math.min(1, opacity + 0.02);
    }
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  document.getElementById('enter-sound').play().catch(()=>{});
  requestAnimationFrame(animate);
})();
