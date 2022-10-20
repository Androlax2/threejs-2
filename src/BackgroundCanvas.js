import { AmbientLight, AnimationMixer, Clock, DirectionalLight, Mesh, PerspectiveCamera, PointLight, Scene, sRGBEncoding, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

export default class BackgroundCanvas {
	#renderer;
	#camera;
	#lightAmbiant;
	#scene;
	#mesh;
	#canvasElement;
	#clock;
	#gltfLoader;
	#controls;
	#directionalLight;
	#mixer;
	#cursorPosition;

	constructor(canvasElement) {
		this.#canvasElement = canvasElement;

		this.#cursorPosition = {
			x: 0,
			y: 0
		};

		this.#clock = new Clock();
		this.#clock.start();

		this.#createRenderer();
		this.#createCamera();
		this.#createScene();
		// this.#createControls();
		this.#createLights();
		this.#createGeometry();

		this.#update();
		window.addEventListener('resize', this.#resize.bind(this));

		window.addEventListener('mousemove', this.#onMouseMove.bind(this));

		window.addEventListener('load', () => {
			window.requestAnimationFrame(this.#enterAnimation.bind(this));
		});
	}

	#createRenderer() {
		this.#renderer = new WebGLRenderer({
			canvas: this.#canvasElement,
			alpha: true,
			antialias: true
		});

		this.#renderer.setSize(window.innerWidth, window.innerHeight);
		this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.#renderer.outputEncoding = sRGBEncoding;
	}

	#createCamera() {
		this.#camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			1,
			100
		);

		this.#camera.position.set(0, 0, 12);
	}

	#createControls() {
		this.#controls = new OrbitControls(this.#camera, this.#canvasElement);
		this.#controls.update();
	}

	#createScene() {
		this.#scene = new Scene();
	}

	/**
	 * TODO : Faire des meilleurs lights
	 * https://sketchfab.com/3d-models/abstract-core-9f8584b1917d47f2ad14d65469b48f44
	 */
	#createLights() {
		this.#lightAmbiant = new AmbientLight(0xffffff, 1);
		this.#scene.add(this.#lightAmbiant);

		this.#directionalLight = new DirectionalLight(0xffffff, 0.5);
		this.#directionalLight.position.set(0, 0, 0);
		this.#scene.add(this.#directionalLight);

		const light1 = new PointLight('#4192AB', 2, 0);
		light1.position.set(10, 10, 5);
		this.#scene.add(light1);

		const light3 = new PointLight(0xffffff, 0.1, 0);
		light3.position.set(-150, -200, -100);
		this.#scene.add(light3);

		const mainLight = new DirectionalLight(0xffffff, 5);
		mainLight.position.set(10, 10, 10);
		this.#scene.add(mainLight);
	}

	#createGeometry() {
		this.#mixer = null;
		this.#gltfLoader = new GLTFLoader();
		this.#mesh = new Mesh();

		this.#gltfLoader.load('./src/3d/scene.gltf', (gltf) => {
			gltf.scene.scale.set(0.1, 0.1, 0.1);

			this.#mesh.add(gltf.scene);

			this.#mixer = new AnimationMixer(gltf.scene);

			gltf.animations.forEach((clip) => {
				this.#mixer.clipAction(clip).play();
			});
		});

		this.#scene.add(this.#mesh);
	}

	#update() {
		window.requestAnimationFrame(this.#update.bind(this));
		this.#renderer.render(this.#scene, this.#camera);

		if (this.#cursorPosition.x !== 0 && this.#cursorPosition.y !== 0) {
			//@formatter:off
			const cameraX = this.#cursorPosition.x - 1;
			const cameraY = this.#cursorPosition.y * -1;
			//@formatter:on

			//@formatter:off
			this.#camera.position.x += (cameraX - this.#camera.position.x) / 10;
			this.#camera.position.y += (cameraY - this.#camera.position.y) / 10;
			//@formatter:on
		}

		if (this.#controls) {
			this.#controls.update();
		}

		if (this.#mixer) {
			this.#mixer.update(this.#clock.getDelta());
		}
	}

	#resize() {
		this.#camera.aspect = window.innerWidth / window.innerHeight;
		this.#camera.updateProjectionMatrix();
		this.#renderer.setSize(window.innerWidth, window.innerHeight);
		this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	#onMouseMove(event) {
		this.#cursorPosition = {
			x: event.clientX / window.innerWidth - 0.5,
			y: event.clientY / window.innerHeight - 0.5
		};
	}

	#enterAnimation() {
		const tl = gsap.timeline();

		tl
		.to(this.#camera.position, {
			z: this.#camera.position.z + 10,
			duration: 2.7,
			ease: 'expo.easeInOut'
		})
		.to(this.#mesh.rotation, {
			y: this.#mesh.rotation.y + 3.2,
			duration: 2.85,
			ease: 'power3.easeIn'
		}, '<15%');
	}
}