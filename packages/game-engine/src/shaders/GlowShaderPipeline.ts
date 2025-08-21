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
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uGlowColor;
uniform float uGlowStrength;
uniform float uInnerGlow;

varying vec2 outTexCoord;
varying float outTexId;
varying float outTintEffect;
varying vec4 outTint;

const float blurSize = 1.0/512.0;
const float intensity = 0.35;

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
    
    // Outer glow effect
    float sum = 0.0;
    int passes = 9;
    
    // Blur in a circle
    for(int i = -4; i <= 4; i++) {
        for(int j = -4; j <= 4; j++) {
            vec2 offset = vec2(float(i), float(j)) * blurSize;
            vec4 sample = texture2D(uMainSampler[0], outTexCoord + offset);
            sum += sample.a * intensity;
        }
    }
    
    // Apply glow
    vec3 glow = uGlowColor * sum * uGlowStrength;
    
    // Inner glow
    if (uInnerGlow > 0.0) {
        float innerSum = 0.0;
        for(int i = -2; i <= 2; i++) {
            for(int j = -2; j <= 2; j++) {
                vec2 offset = vec2(float(i), float(j)) * blurSize * 0.5;
                vec4 sample = texture2D(uMainSampler[0], outTexCoord + offset);
                innerSum += (1.0 - sample.a) * intensity;
            }
        }
        glow += uGlowColor * innerSum * uInnerGlow * color.a;
    }
    
    // Pulsing effect
    float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
    glow *= pulse;
    
    // Combine original color with glow
    color.rgb += glow * (1.0 - color.a);
    color.rgb = mix(color.rgb, color.rgb + glow, uGlowStrength);
    
    gl_FragColor = color;
}
`;

export class GlowShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  private _time: number = 0;
  private _glowColor: number[] = [1.0, 0.8, 0.2];
  private _glowStrength: number = 1.0;
  private _innerGlow: number = 0.5;

  constructor(game: Phaser.Game) {
    super({
      game,
      name: 'GlowShader',
      vertShader: vertexShader,
      fragShader: fragmentShader,
    });
  }

  onPreRender(): void {
    this._time += 0.01;
    this.set1f('uTime', this._time);
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
    this.set3f('uGlowColor', this._glowColor[0], this._glowColor[1], this._glowColor[2]);
    this.set1f('uGlowStrength', this._glowStrength);
    this.set1f('uInnerGlow', this._innerGlow);
  }

  setGlowColor(r: number, g: number, b: number): void {
    this._glowColor = [r, g, b];
  }

  setGlowStrength(value: number): void {
    this._glowStrength = Math.max(0, Math.min(2, value));
  }

  setInnerGlow(value: number): void {
    this._innerGlow = Math.max(0, Math.min(1, value));
  }
}