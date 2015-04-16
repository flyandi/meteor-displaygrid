/**
 * DisplayGrid
 */


(function() {


	DisplayGrid = function(width, height, target, theme) {

		this.width = width;
		this.height = height;
		this.target = target;

		this.initialize();
		this.render();
	};


	DisplayGrid.prototype = {

		initialize: function() {

			this.canvas = document.createElement("canvas");
			this.context = this.canvas.getContext("2d");
			this.target.appendChild(this.canvas);

			this.resize();

			window.addEventListener("resize", function() {
				this.resize();
			}.bind(this));

			this.clear();
			this.theme(false, true);

			// events
			this.events = {

				tap: function(e) {
					e.preventDefault();
					e.stopPropagation();

					this.detect(e.offsetX, e.offsetY);

				}.bind(this),

			};



			this.canvas.addEventListener("mouseup", this.events.tap); 
			this.canvas.addEventListener("touchend", this.events.tap); 

		},

		detect: function(x, y) {

			var dx = Math.floor((x - this.cx) / this.cs), 
				dy = Math.floor((y - this.cy) / this.cs);

			if(dx >= 0 && dx < this.width && dy >= 0 && dy < this.height) {

				this.toggle(dx, dy);
			}
		},

		resize: function(width, height) {

			this.canvas.width = width || this.target.offsetWidth;
			this.canvas.height = height || this.target.offsetHeight;

			this.render();
		},

		theme: function(theme, n) {

			this.theme = theme || {
				grid: '#aaa',
				color: 'green',
				background: 'white',
			};
		},

		render: function() {

			// initialize
			var self = this,
				dw = this.canvas.width, 
				dh = this.canvas.height;
			
			this.cs = Math.floor(dw > dh ? (dh / this.height) : (dw / this.width)),
			this.cx = Math.floor((dw - (this.cs * this.width)) / 2),
			this.cy = Math.floor((dh - (this.cs * this.height)) / 2);

			this.cx = this.cx > 0 ? this.cx : 0;
			this.cy = this.cy > 0 ? this.cy : 0;
			
			// draw grid
			for(var sy = 0; sy < this.height; sy++) {
				for(var sx = 0; sx < this.width; sx++) {

					this.context.rect(this.cx + sx * this.cs + 0.5, this.cy + sy * this.cs + 0.5, this.cs, this.cs);

				}
			}

			this.context.strokeStyle = this.theme.grid;
			this.context.stroke();



			// draw pixels
			if(this.buffer) {
				this.buffer.forEach(function(column, y) {
					column.forEach(function(color, x) {
						self.renderRect(x, y, color);
					});
				});	
			};

		},

		renderRect: function(x, y, color) {
			this.context.fillStyle = color;
			this.context.fillRect(this.cx + x * this.cs + 1.5, this.cy + y * this.cs + 1.5, this.cs - 2, this.cs - 2);
		},


		clear: function() {

			this.buffer = [];

			this.render();

		},

		get: function(x, y) {
			return this.buffer[y] && this.buffer[y][x] ? this.buffer[y][x] : false;
		},


		pixel: function(x, y, color) {

			if(x < 0 || x >= this.width || y < 0 || y >= this.height) return;

			if(!this.buffer[y]) this.buffer[y] = [];

			this.buffer[y][x] = color;

			this.renderRect(x, y, color === 0 ? this.theme.background : ( color || this.theme.color));

		},

		toggle: function(x, y) {
			this.pixel(x, y, this.get(x, y) != false ? 0 : this.theme.color);
		},	


		draw: function(x, y, buffer) {

			var c = 0, 
				data = Array.prototype.slice.call(buffer.data);

			for(var py = 0; py < buffer.height; py++) {

				for(var px = 0; px < buffer.width; px++) {

					this.pixel(x + px, y + py, "rgba(" + data.slice(c, c + 4).join(",") + ")");

					c += 4;
				}

			}

		},

		load: function(x, y, url, loaded) {

			var img = document.createElement("img"),
				canvas = document.createElement("canvas");

			img.addEventListener("load", function() {

				var ctx = canvas.getContext('2d');

				canvas.width = img.width;
				canvas.height = img.height;

				// automatic resize
				var w = img.width,
					h = img.height,
					ratio = 1;
				
				if(w > this.width) {
					ratio = this.width / img.width;
				} else if (h > this.height) {
					ratio = this.height / img.height;
				}

				w = Math.floor(w * ratio);
				h = Math.floor(h * ratio);

				// data URL
				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);

				this.draw(x, y, canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));

				if(typeof(loaded) == "function") {

					loaded.bind(this).call();
				}

			}.bind(this));

			img.src = url;
		},

		/** 
		 * ::exports
		 */

		toSerialImage: function(returnRaw) {

			var buffer = [],
				half = Math.floor(this.cs / 2);

			for(var y = 0; y < this.height; y++) {
				for(var x = 0; x < this.width; x++) {

					var p = this.context.getImageData(
						this.cx + (x * this.cs) + half,
						this.cy + (y * this.cs) + half,
						5, 5
					);

					for(var i = 0; i < 3;i++)
						buffer.push(p.data[i]);
				}
			}

			return returnRaw ? buffer : buffer.join(" ");
		}

	};


	return DisplayGrid;

})();