import {styler, easing, keyframes, parallel} from 'popmotion'
import Vue from 'vue/dist/vue.common.js'
let app = Vue.component('app', {
    data: () => ({duration: 1500}),
    template: `
      <div id="App" class="App">
        <div class="canv">
          <div class="small" ref="small"></div>
          <div class="big" ref="big"></div>
        </div>
      </div>
    `,
    mounted() {
        this.bigStyler = styler(this.$refs.big)
        this.smallStyler = styler(this.$refs.small)
        this.handleJump()
    },
    methods: {
        jump() {
            const move = keyframes({
                    values: [
                        {
                            scaleX: 1.4,
                            scaleY: 0.6,
                            y: 0
                        }, {
                            scaleX: 1,
                            scaleY: 1,
                            y: 0
                        }, {
                            scaleX: 1,
                            scaleY: 1,
                            y: -200
                        }, {
                            scaleX: 1,
                            scaleY: 1,
                            y: 0
                        }, {
                            scaleX: 1.4,
                            scaleY: 0.6,
                            y: 0
                        }
                    ],
                    duration: this.duration,
                    times: [
                        0, 0.15, 0.5, 0.85, 1
                    ],
                    easings: [
                        easing.circIn, easing.circOut, easing.circIn, easing.circOut
                    ],
                    // ease: easing.circInOut,
                    loop: Infinity
                }),
                rotate = keyframes({
                    values: [
                        {
                            rot: 0
                        }, {
                            rot: 0
                        }, {
                            rot: -360
                        }, {
                            rot: -360
                        }
                    ],
                    duration: this.duration,
                    times: [
                        0, 0.15, 0.85, 1
                    ],
                    easings: [
                        easing.linear, easing.circInOut, easing.linear
                    ],
                    loop: Infinity
                })
            return parallel(move, rotate)
        },
        jumpsmall() {
            const move = keyframes({
                    values: [
                        {
                            scaleX: 1.5,
                            scaleY: 0.5,
                            y: -60
                        }, {
                            scaleX: 1,
                            scaleY: 1,
                            y: -100
                        }, {
                            scaleX: 1,
                            scaleY: 1,
                            y: -400
                        }, {
                            scaleX: 1,
                            scaleY: 1,
                            y: -100
                        }, {
                            scaleX: 1.5,
                            scaleY: 0.5,
                            y: -60
                        }
                    ],
                    duration: this.duration,
                    times: [
                        0, 0.15, 0.5, 0.85, 1
                    ],
                    easings: [
                        easing.circIn, easing.circOut, easing.circIn, easing.circOut
                    ],
                    // ease: easing.circInOut,
                    loop: Infinity
                }),
                rotate = keyframes({
                    values: [
                        {
                            rot: 0
                        }, {
                            rot: 0
                        }, {
                            rot: 360
                        }, {
                            rot: 360
                        }
                    ],
                    duration: this.duration,
                    times: [
                        0, 0.15, 0.85, 1
                    ],
                    easings: [
                        easing.linear, easing.circInOut, easing.linear
                    ],
                    loop: Infinity
                })
            return parallel(move, rotate)
        },
        multijump() {
            return parallel(this.jump(), this.jumpsmall())
        },
        handleJump() {
            this.multijump().start({
                update: (v) => {
                    const origin = v[0][0].scaleX === 1
                        ? 'center center'
                        : 'center bottom'
                    this.bigStyler.set({y: v[0][0].y,
                        scaleX: v[0][0].scaleX,
                        scaleY: v[0][0].scaleY,
                        rotate: v[0][1].rot,
                        transformOrigin: origin
                    })
                    this.smallStyler.set({y: v[1][0].y,
                        scaleX: v[1][0].scaleX,
                        scaleY: v[1][0].scaleY,
                        rotate: v[1][1].rot,
                        transformOrigin: origin
                    })
                },
                // complete: () => console.log('complete triggered'),
            })
        }
    }
})

new Vue({el: '#app', data: {}, components: {app}})
