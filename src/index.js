/**
 * Created by Abaddon on 22.08.2016.
 */
"use strict";
import Item from "./components/ParallaxBox";
import Uses from "./utility/UsesFunction";
import SmoothScroll from "./components/SmoothScroll";
import ImageParallax from "./components/ImageParallax";
import VideoParallax from "./components/VideoParallax";
import ContentParallax from "./components/ContentParallax";

class NoJqueryParallax {
    constructor(options) {
        this.parallaxInstances = [];
        this.smooth = {};
        this.observer = {};
        this.resizeDelay = null; 
        //Set plugin options
        this.config = NoJqueryParallax.merge({
            box: ".js-parallax-box",
            bg: ".js-parallax-bg",
            smooth: true,
            observe: true,
            loadBox: function () {
            }
        }, options);
    }

    /**
     * Run parallax effect
     */
    run() {
        this.sections = document.querySelectorAll(this.config.box);
        let ln = this.sections.length;
        if (!ln) return false;

        for (let i = 0; i < ln; i++) {
            let item = new Item(this.sections[i], this.config.bg), instance = null;
            switch (item.getSourceType()) {
                case "image":
                    instance = new ImageParallax(item, this.config);
                    break;
                case "video":
                    instance = new VideoParallax(item, this.config);
                    break;
                case "content":
                    instance = new ContentParallax(item, this.config);
                    break;
                default:
            }
            if (instance) {
                instance.start();
                this.parallaxInstances.push(instance);
            }
        }
        //Bind events
        this._subscribe();
    }

    /**
     * Ext object
     * @param self
     * @param source
     * @returns {*}
     */
    static merge(self, source) {
        for (let i in source) {
            if (source.hasOwnProperty(i)) {
                self[i] = source[i];
            }
        }
        return self;
    }

    /**
     * Subscribe plugin for window events
     * @private
     */
    _subscribe() {
        //Smooth scroll
        if (this.config.smooth) {
            this.smooth = new SmoothScroll();
            this.smooth.run();
            //Set dom observe
            if (this.config.observe) {
                this.setObserve();
            }
        }
        //Scroll window
        if (!Uses.isLiteMode()) {
            this.scFn = this._scrollTic.bind(this);
            window.addEventListener("scroll", this.scFn, false);
        }
        //Resize window
        this.rezFn = this._resizeTic.bind(this);
        window.addEventListener("resize", this.rezFn, false)
    }

    /**
     * Call handlers for scroll
     * @private
     */
    _scrollTic() {
        let ln = this.parallaxInstances.length;
        for (let i = 0; i < ln; i++) {
            this.parallaxInstances[i].scrollTick();
        }
    }

    /**
     * Set dom observe for rebuild smooth scroll
     * @private
     */
    setObserve() {
        try {
            let self = this;
            this.observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === "childList") {
                        self.smooth.update();
                    }
                })
            });

            this.observer.observe(document.body, {
                childList: true
            });
        } catch (e) {
            console.warn("Your browser not supported MutationObserve!");
        }
    }

    /**
     * Stop document observer
     */
    stopObserve() {
        this.observer.disconnect();
    }

    /**
     * Call handlers when window change sizes
     * @private
     */
    _resizeTic() {
        let ln = this.parallaxInstances.length;
        clearTimeout(this.resizeDelay);
        this.resizeDelay = setTimeout(() => {
            for (let i = 0; i < ln; i++) {
                this.parallaxInstances[i].resizeTick();
            }
            this.smooth.resizeTick();
        }, 500);
    }

    /**
     * Remove event handlers
     */
    stop() {
        window.removeEventListener("scroll", this.scFn, false);
        window.removeEventListener("resize", this.rezFn, false);
    }

    /**
     * Stop smooth scrolling
     */ 
    stopSmooth() {
        this.smooth.stop();
    }

    /**
     * Start smooth scrolling
     */
    startSmooth() {
        this.smooth.run();
    }
}
global.NoJqueryParallax = NoJqueryParallax;
export default NoJqueryParallax;