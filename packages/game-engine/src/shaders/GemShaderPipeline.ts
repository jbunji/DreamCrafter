import * as Phaser from 'phaser';

const vertexShader = `
precision mediump float;

uniform mat4 uProjectionMatrix;
attribute vec2 inPosition;
attribute vec2 inTexCoord;
attribute float inTexId;
attribute float inTintEffect;
attribute vec4 inTint;

varying vec2 outTexCoord;
varying float outTexId;
varying float outTintEffect;
varying vec4 outTint;

void main() {
    gl_Position = uProjectionMatrix * vec4(inPosition, 0.0, 1.0);
    outTexCoord = inTexCoord;
    outTexId = inTexId;
    outTintEffect = inTintEffect;
    outTint = inTint;
}
`;

const fragmentShader = `
precision mediump float;

uniform sampler2D uMainSampler[%count%];
uniform float uTime;
uniform vec3 uHighlightColor;
uniform float uGlossiness;

varying vec2 outTexCoord;
varying float outTexId;
varying float outTintEffect;
varying vec4 outTint;

void main() {
    vec4 texture;
    
    %forloop%
    
    vec4 texel = vec4(outTint.bgr * outTint.a, outTint.a);
    vec4 color = texture * texel;
    
    if (outTintEffect == 1.0) {
        color.bgr = mix(texture.bgr, outTint.bgr * outTint.a, texture.a);
    } else if (outTintEffect == 2.0) {
        color = texel;
    }
    
    // Glossy rim lighting
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(outTexCoord, center);
    float rim = 1.0 - smoothstep(0.3, 0.5, dist);
    rim = pow(rim, 2.0) * uGlossiness;
    
    // Animated sparkle
    float sparkle = sin(uTime * 3.0 + outTexCoord.x * 10.0) * 0.05 + 0.95;
    
    // Specular highlight
    vec2 highlightPos = vec2(0.3, 0.3);
    float highlight = 1.0 - distance(outTexCoord, highlightPos);
    highlight = pow(max(0.0, highlight), 8.0) * 0.4;
    
    // Apply effects
    color.rgb += uHighlightColor * rim * color.a;
    color.rgb *= sparkle;
    color.rgb += vec3(highlight) * color.a;
    
    // Subtle inner glow
    float innerGlow = 1.0 - dist;
    innerGlow = pow(innerGlow, 1.5);
    color.rgb += color.rgb * innerGlow * 0.15;
    
    gl_FragColor = color;
}
`;

export class GemShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  private _time: number = 0;
  private _highlightColor: number[] = [1.0, 1.0, 1.0];
  private _glossiness: number = 0.8;

  constructor(game: Phaser.Game) {
    super({
      game,
      name: 'GemShader',
      vertShader: vertexShader,
      fragShader: fragmentShader,
    });
  }

  onPreRender(): void {
    this._time += 0.01;
    this.set1f('uTime', this._time);
    this.set3f('uHighlightColor', this._highlightColor[0], this._highlightColor[1], this._highlightColor[2]);
    this.set1f('uGlossiness', this._glossiness);
  }

  setHighlightColor(r: number, g: number, b: number): void {
    this._highlightColor = [r, g, b];
  }

  setGlossiness(value: number): void {
    this._glossiness = Math.max(0, Math.min(1, value));
  }
}