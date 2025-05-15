class Live2dV3 {
  public l2d: L2D;
  public audio: Audio;
  public basePath: string;
  public bg;
  public modelName: string;
  public folderName: string;
  public canvas: HTMLDivElement;
  public app: PIXI.Application;
  public model;
  public animator;
  public motions;
  public children;

  private _animator;
  private _coreModel;
  private _meshes;
  private _physicsRig;

  constructor({
		folderName,
		basePath,
		modelName,
		width = 500,
		height = 300,
		bg = "assets/res/basic/scene/bg/kanban/green.png",
		el,
		sizeLimit,
		mobileLimit,
		sounds,
	}) {
		if (typeof Live2DCubismCore === "undefined") {
			console.error(
				'live2dv3 failed to load:\nMissing live2dcubismcore.js\nPlease add "https://cdn.jsdelivr.net/gh/HCLonely/Live2dV3/js/live2dcubismcore.min.js" to the "<script>" tag.\nLook at https://github.com/HCLonely/Live2dV3',
			);
			return;
		}
		if (typeof PIXI === "undefined") {
			console.error(
				'live2dv3 failed to load:\nMissing pixi.js\nPlease add "https://cdn.jsdelivr.net/npm/pixi.js@4.6.1/dist/pixi.min.js" to the "<script>" tag.\nLook at https://github.com/HCLonely/Live2dV3',
			);
			return;
		}
		if (!el) {
			console.error('"el" parameter is required');
			return;
		}

		if (!this.isDom(el)) {
			if (el.length > 0) {
				if (this.isDom(el[0])) {
					el = el[0];
				} else {
					console.error(
						"live2dv3 failed to load:\n",
						el[0],
						"is not a HTMLElement object",
					);
					return;
				}
			} else {
				console.error(
					"live2dv3 failed to load:\n",
					el,
					"is not a HTMLElement object",
				);
				return;
			}
		}

		if (
			sizeLimit &&
			(document.documentElement.clientWidth < width ||
				document.documentElement.clientHeight < height)
		)
			return;
		if (
			mobileLimit &&
			/Mobile|Mac OS|Android|iPhone|iPad/i.test(navigator.userAgent)
		)
			return;

		this.l2d = new L2D(basePath);
		//external audio
		this.audio = new Audio();
		this.basePath = basePath;
		//external bg
		this.bg = bg;
		this.folderName = folderName;
		//external bgeffect
		//bgEffect.backgroundManager(folderName, this);

		this.canvas = el;

		if (modelName) {
			this.modelName = modelName;
			this.l2d.load(folderName, modelName, this);
		}

		this.app = new PIXI.Application(width, height, { transparent: true });
		this.canvas.appendChild(this.app.view);

		this.app.ticker.add((deltaTime) => {
			if (!this.model) {
				return;
			}

			this.model.update(deltaTime);
			this.model.masks.update(this.app.renderer);
		});

		window.onresize = (event) => {
			if (event === undefined) {
				event = null;
			}
			this.app.view.style.width = `${width}px`;
			this.app.view.style.height = `${height}px`;
			this.app.renderer.resize(width, height);

			if (this.model) {
				this.model.position = new PIXI.Point(width * 0.5, height * 0.5);
				this.model.scale = new PIXI.Point(
					this.model.position.x * 1,
					this.model.position.x * 1,
				);
				this.model.masks.resize(this.app.view.width, this.app.view.height);

				//modification date a live
				if (document.getElementById("posx"))
					this.model.position = new PIXI.Point(
						document.getElementById("posx").value,
						document.getElementById("posy").value,
					);
			}
		};
		this.isClick = false;
		this.app.view.addEventListener("mousedown", (event) => {
			this.isClick = true;
		});
		this.app.view.addEventListener("mousemove", (event) => {
			if (this.isClick) {
				this.isClick = false;
				if (this.model) {
					this.model.inDrag = true;
				}
			}

			if (this.model) {
				const mouseX = this.model.position.x - event.offsetX;
				const mouseY = this.model.position.y - event.offsetY;
				this.model.pointerX = -mouseX / this.app.view.height;
				this.model.pointerY = -mouseY / this.app.view.width;
			}
		});
		this.app.view.addEventListener("mouseup", (event) => {
			if (!this.model) {
				return;
			}

			if (this.isClick) {
				/*
          if (this.isHit('TouchHead', event.offsetX, event.offsetY)) {
            this.startAnimation('touch_head', 'base')
          } else if (this.isHit('TouchSpecial', event.offsetX, event.offsetY)) {
            this.startAnimation('touch_special', 'base')
          } else {
            const bodyMotions = ['touch_body', 'main_1', 'main_2', 'main_3']
            const currentMotion = bodyMotions[Math.floor(Math.random() * bodyMotions.length)]
            this.startAnimation(currentMotion, 'base')
          }
          if (sounds && sounds.length > 0) {
            const soundFile = sounds[Math.floor((Math.random() * sounds.length))]
            const filePath = /^https?:\/\//.test(soundFile) ? soundFile : [basePath, modelName, soundFile].join('/').replace(/(?<!:)\/\//g, '/')
            if (typeof Howl !== 'undefined') {
              new Howl({ src: [filePath] }).play()
            } else if (typeof Audio !== 'undefined') {
              new Audio(filePath).play()
            } else {
              console.error('Current browser does not support playing sound.')
            }
          }
          */
				//dal model
				if (this.isHit("HitArea", event.offsetX, event.offsetY)) {
					console.log("head");
					if (this.model.motions.get(`id_favor${favorLevel}_${1}`))
						this.startAnimation(`id_favor${favorLevel}_${1}`, "base");
				}
				if (this.isHit("HitArea2", event.offsetX, event.offsetY)) {
					console.log("pai");
					if (this.model.motions.get(`id_favor${favorLevel}_${2}`))
						this.startAnimation(`id_favor${favorLevel}_${2}`, "base");
				}
				if (this.isHit("HitArea3", event.offsetX, event.offsetY)) {
					console.log("idk");
					if (this.model.motions.get(`id_favor${favorLevel}_${3}`))
						this.startAnimation(`id_favor${favorLevel}_${3}`, "base");
				}
			}

			this.isClick = false;
			this.model.inDrag = false;
		});
	}

	changeCanvas(model, bg = "assets/res/basic/scene/bg/kanban/green.png") {
		this.app.stage.removeChildren();

		this.model = model;
		this.model.update = this.onUpdate;
		this.model.animator.addLayer(
			"base",
			LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE,
			1,
		);
		//background
		const foreground = PIXI.Sprite.from(bg);
		//calculator
		if (foreground.height !== 1) {
			let hRatio = foreground.height / window.innerHeight;
			let wRatio = foreground.width / window.innerWidth;
			let ratio;
			if (hRatio >= 1 && wRatio >= 1) {
				//too high, so we scale downn
				hRatio = 1 / hRatio;
				wRatio = 1 / wRatio;
				ratio = hRatio >= wRatio ? hRatio : wRatio;
			} else {
				if (hRatio >= 1) {
					ratio = 1 / wRatio;
				} else if (wRatio >= 1) {
					ratio = 1 / hRatio;
				} else {
					//lower, ex 0.8 and 0.9
					// lek ben 1, 1 = 0.8 * x, x=1/0.8
					hRatio = 1 / hRatio;
					wRatio = 1 / wRatio;
					ratio = hRatio >= wRatio ? hRatio : wRatio;
				}
			}
			foreground.width *= ratio;
			foreground.height *= ratio;
		}
		foreground.texture.baseTexture.on("loaded", () => {
			let hRatio = foreground.height / window.innerHeight;
			let wRatio = foreground.width / window.innerWidth;
			let ratio;
			if (hRatio >= 1 && wRatio >= 1) {
				//too high, so we scale downn
				hRatio = 1 / hRatio;
				wRatio = 1 / wRatio;
				ratio = hRatio >= wRatio ? hRatio : wRatio;
			} else {
				if (hRatio >= 1) {
					//upsize w
					ratio = 1 / wRatio;
				} else if (wRatio >= 1) {
					//upsize h
					ratio = 1 / hRatio;
				} else {
					//lower, ex 0.8 and 0.9
					// lek ben 1, 1 = 0.8 * x, x=1/0.8
					hRatio = 1 / hRatio;
					wRatio = 1 / wRatio;
					ratio = hRatio >= wRatio ? hRatio : wRatio;
				}
			}
			foreground.width *= ratio;
			foreground.height *= ratio;
		});
		this.app.stage.addChild(foreground);
		bgEffect.backgroundManager(this.folderName, this);
		const waitBg = setInterval(() => {
			if (bgEffect.isLoaded) {
				clearInterval(waitBg);
				this.app.stage.addChild(this.model);
				this.app.stage.addChild(this.model.masks);
			}
		}, 500);

		window.onresize();
	}

	onUpdate(delta) {
		const deltaTime = 0.016 * delta;

		if (!this.animator.isPlaying) {
			const m = this.motions.get("idle");
			this.animator.getLayer("base").play(m);
		}
		this._animator.updateAndEvaluate(deltaTime);

		if (this.inDrag) {
			this.addParameterValueById("ParamAngleX", this.pointerX * 30);
			this.addParameterValueById("ParamAngleY", -this.pointerY * 30);
			this.addParameterValueById("ParamBodyAngleX", this.pointerX * 10);
			this.addParameterValueById("ParamBodyAngleY", -this.pointerY * 10);
			this.addParameterValueById("ParamEyeBallX", this.pointerX);
			this.addParameterValueById("ParamEyeBallY", -this.pointerY);
		}

		if (this._physicsRig) {
			this._physicsRig.updateAndEvaluate(deltaTime);
		}

		this._coreModel.update();

		let sort = false;
		for (let m = 0; m < this._meshes.length; ++m) {
			this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
			this._meshes[m].visible = Live2DCubismCore.Utils.hasIsVisibleBit(
				this._coreModel.drawables.dynamicFlags[m],
			);
			if (
				Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(
					this._coreModel.drawables.dynamicFlags[m],
				)
			) {
				this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[m];
				this._meshes[m].dirtyVertex = true;
			}
			if (
				Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(
					this._coreModel.drawables.dynamicFlags[m],
				)
			) {
				sort = true;
			}
		}

		if (sort) {
			this.children.sort((a, b) => {
				const aIndex = this._meshes.indexOf(a);
				const bIndex = this._meshes.indexOf(b);
				const aRenderOrder = this._coreModel.drawables.renderOrders[aIndex];
				const bRenderOrder = this._coreModel.drawables.renderOrders[bIndex];

				return aRenderOrder - bRenderOrder;
			});
		}

		this._coreModel.drawables.resetDynamicFlags();
	}

	startAnimation(motionId, layerId) {
		if (!this.model) {
			return;
		}

		const m = this.model.motions.get(motionId);
		if (!m) {
			return;
		}

		const l = this.model.animator.getLayer(layerId);
		if (!l) {
			return;
		}

		if (this.audio) this.audio.pause();
		const mmotions = JSON.parse(
			httpGet(
				`${this.basePath}/${this.folderName}/${this.modelName}.model3.json`,
			),
		);

		for (const i in mmotions.FileReferences.Motions) {
			if (i.toLowerCase() === motionId) {
				if (mmotions.FileReferences.Motions[i][0].Sound) {
					const audioPath = `assets/res/basic/${mmotions.FileReferences.Motions[i][0].Sound}`;
					this.audio = new Audio(audioPath);
					this.audio.play();

					this.audio.addEventListener(
						"canplay",
						() => {
							l.play(m);
						},
						false,
					);
					//subtitle
					if (!document.getElementById("subtitle").checked) break;
					const subtitleJSON = JSON.parse(httpGet("assets/res/data/subtitle.json"));
					if (subtitleJSON[this.folderName]) {
						if (subtitleJSON[this.folderName][motionId]) {
							const subtitleElement =
								document.getElementsByClassName("subtitle")[0];
							subtitleElement.innerHTML =
								subtitleJSON[this.folderName][motionId];
							//tempDiv.style.whiteSpace = 'nowrap';
							//document.body.appendChild(tempDiv);
							//subtitleElement.style.left = (window.innerWidth / 2) - (tempDiv.clientWidth) + 'px';
							//document.body.removeChild(tempDiv);

							subtitleElement.classList.add("in");
							setTimeout(() => {
								subtitleElement.style.display = "block";
							}, 500);
							this.audio.onended = () => {
								subtitleElement.classList.remove("in");
								subtitleElement.classList.add("out");
								setTimeout(() => {
									subtitleElement.style.display = "none";
									subtitleElement.classList.remove("out");
								}, 500);
							};
						}
					}
					break;
				}
				l.play(m);
			}
		}
		//pls timeout alternative
		//setTimeout(function(){l.play(m)},650)

		//external audio
	}

	isHit(id, posX, posY) {
		if (!this.model) {
			return false;
		}

		const m = this.model.getModelMeshById(id);
		if (!m) {
			return false;
		}

		const vertexOffset = 0;
		const vertexStep = 2;
		const vertices = m.vertices;

		let left = vertices[0];
		let right = vertices[0];
		let top = vertices[1];
		let bottom = vertices[1];

		for (let i = 1; i < 4; ++i) {
			const x = vertices[vertexOffset + i * vertexStep];
			const y = vertices[vertexOffset + i * vertexStep + 1];

			if (x < left) {
				left = x;
			}
			if (x > right) {
				right = x;
			}
			if (y < top) {
				top = y;
			}
			if (y > bottom) {
				bottom = y;
			}
		}

		const mouseX = m.worldTransform.tx - posX;
		const mouseY = m.worldTransform.ty - posY;
		const tx = -mouseX / m.worldTransform.a;
		const ty = -mouseY / m.worldTransform.d;

		return left <= tx && tx <= right && top <= ty && ty <= bottom;
	}

	isDom(e) {
		if (typeof HTMLElement === "object") {
			return e instanceof HTMLElement;
		}
		return (
			e &&
			typeof e === "object" &&
			e.nodeType === 1 &&
			typeof e.nodeName === "string"
		);
	}

	loadModel(modelName) {
		this.l2d.load(modelName || this.modelName, this);
	}
}
