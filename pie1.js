var LABEL_LOCATION_ALONG_RADIUS = 1;
var LABEL_LOCATION_ALONG_ARC = 2;

function PieSegment(id, value, label, colors, labelLocation) {
	this.id = id;
	this.value = value;
	this.label = label;
	this.colors = colors;
	this.labelLocation = labelLocation;
	this.isSelected = false;
}

function Pie(id, o) {
	this.includeLabels = false;
	if (o.includeLabels == undefined) {
		this.includeLabels = false;
	}
	else {
		this.includeLabels = o.includeLabels;
	}
	this.segments = o.segments;
	this.canvas = document.getElementById(id);
}

Pie.prototype = {
	draw: function() {
		var self = this;
		var context = this.canvas.getContext("2d");
		for (var i = 0; i < this.segments.length; i++) {
			this.drawSegment(this.canvas, context, i, this.segments[i], this.includeLabels);
		}
	},

	drawSegment: function(canvas, context, i, segment, includeLabels) {
		var self = this;
		context.save();
		var centerX = Math.floor(canvas.width / 2);
		var centerY = Math.floor(canvas.height / 2);
		var radius = Math.floor(canvas.width / 2);

		var startingAngle = self.degreesToRadians(self.sumTo(self.segments, i));
		var arcSize = self.degreesToRadians(segment.value);
		var endingAngle = startingAngle + arcSize;

		context.beginPath();
		context.moveTo(centerX, centerY);
		context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
		context.closePath();

		segment.isSelected ? 
			context.fillStyle = segment.colors[1] :
			context.fillStyle = segment.colors[0];

		context.fill();
		context.restore();

		if (includeLabels && (segment.label !== undefined)) {
			if (segment.labelLocation == LABEL_LOCATION_ALONG_ARC) {
				self.drawSegmentLabelAlongArc(canvas, context, i, segment);
			} else {
				self.drawSegmentLabel(canvas, context, i, segment);
			}
		}
	},

	drawSegmentLabel: function(canvas, context, i, segment) {
		var self = this;
		var isSelected = segment.isSelected;
		context.save();
		var radius
		var x = radius = Math.floor(canvas.width / 2);
		var y = Math.floor(canvas.height / 2);
		var angle = self.degreesToRadians(self.sumTo(self.segments, i));

		context.translate(x, y);
		context.rotate(angle);
		context.textAlign = "right";
		var fontSize = Math.floor(radius * 2 / 35);
		context.font = fontSize + "pt Helvetica";

		var dx = Math.floor(canvas.width * 0.5) - 10;
		var dy = Math.floor(canvas.height * 0.05);
		context.fillText(segment.label, dx, dy);

		context.restore();
	},
	
	drawTextAlongArc: function (context, str, centerX, centerY, radius, angle) {
        context.rotate(-1 * angle / 2);
        context.rotate(-1 * (angle / str.length) / 2);
		var fontSize = Math.floor(radius * 2 / 35);
		context.font = fontSize + "pt Helvetica";
		var probableHeight = context.measureText("e").width * 2;
		
		var totWidth = context.measureText(str).width;
		
		// First char
		var n = 0;
		var ch = str.charAt(n);
		var chWidth = context.measureText(ch).width;
		var chAngle = chWidth * angle / totWidth;
		this.log (ch + " : " + chWidth + " : " + chAngle + "\n")
		context.rotate(angle / str.length);
		
		context.save();
		context.translate(0, -1 * (radius - probableHeight));
		context.fillText(ch, 0, 0);
		context.restore();
		n++;
		for (; n<str.length; n++) {
			context.rotate(chAngle);
          context.save();
          context.translate(0, -1 * (radius - probableHeight));
          ch = str.charAt(n);
		  chWidth = context.measureText(ch).width;
		  chAngle = chWidth * angle / totWidth;
		  this.log (ch + " : " + chWidth + " : " + chAngle + "\n")
          context.fillText(ch, 0, 0);
          context.restore();
		}
      },
	
	drawSegmentLabelAlongArc: function(canvas, context, i, segment) {
		var self = this;
		var centerX = Math.floor(canvas.width / 2);
		var centerY = Math.floor(canvas.height / 2);
		context.save();
		var totAngle = self.degreesToRadians(self.sumToIncl(self.segments, i - 1));
		var nextAngle = self.degreesToRadians(self.segments[(i > self.segments.length - 1 ? 0 : i)].value);
		var rotAngle = (3*Math.PI - nextAngle - (2 * totAngle))/2;
		
		context.translate(centerX, centerY);
		context.rotate(-1*rotAngle);
		
		var radius = Math.floor(canvas.width / 2);
		
		var txt = segment.label;
		
		// What length does it take to fit this text?
		var probableWidth = context.measureText(txt).width;
		
		// What is the arc length?
		var arcLength = nextAngle * radius;
		
		// How much angle do we need to fit our text?
		var requiredAngle = ((probableWidth / arcLength) * nextAngle) + (txt.length * 0.02);
		
		self.log(i + " : " + self.r2d(totAngle) + " : " + self.r2d(nextAngle) + " : " + self.r2d(rotAngle) + " : " + arcLength + " : " + probableWidth + " : " + self.r2d(requiredAngle) + "\n");
		
		self.drawTextAlongArc(context, txt, centerX, centerY, radius, requiredAngle);
		
		context.restore();
	},

	drawLabel: function(i) {
		var self = this;
		var context = this.canvas.getContext("2d");
		var size = self.data[i];

		self.drawSegmentLabel1(this.canvas, context, i, size, false);
	},

	// helper functions
	log: function(msg) {
		// document.getElementById("logTa").value += msg;
	},
	
	r2d: function(rad) {
		return (rad * 180)/Math.PI;
	},
	
	degreesToRadians: function(degrees) {
		return (degrees * Math.PI)/180;
	},

	sumTo: function(segments, i) {
		var sum = 0;
		for (var j = 0; j < i; j++) {
			sum += segments[j].value;
		}
		return sum;
	},
	
	sumToIncl: function(segments, i) {
		var sum = 0;
		for (var j = 0; j <= i; j++) {
			sum += segments[j].value;
		}
		return sum;
	}

}