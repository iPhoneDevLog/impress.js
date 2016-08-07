/**
 * Relative Positioning Plugin
 *
 * This plugin provides support for defining the coordinates of a step relative
 * to the previous step. This is often more convenient when creating presentations,
 * since as you add, remove or move steps, you may not need to edit the positions
 * as much as is the case with the absolute coordinates supported by impress.js
 * core.
 * 
 * Example:
 * 
 *         <!-- Position step 1000 px to the right and 500 px up from the previous step. -->
 *         <div class="step" data-rel-x="1000" data-rel-y="500">
 * 
 * Following html attributes are supported for step elements:
 * 
 *     data-rel-x
 *     data-rel-y
 *     data-rel-z
 * 
 * These values are also inherited from the previous step. This makes it easy to 
 * create a boring presentation where each slide shifts for example 1000px down 
 * from the previous.
 * 
 * In addition to plain numbers, which are pixel values, it is also possible to
 * define relative positions as a multiple of screen height and width, using
 * a unit of "h" and "w", respectively, appended to the number.
 * 
 * Example:
 *
 *        <div class="step" data-rel-x="1.5w" data-rel-y="1.5h">
 *
 * This plugin is a *pre-init plugin*. It is called synchronously from impress.js
 * core at the beginning of `impress().init()`. This allows it to process its own
 * data attributes first, and possibly alter the data-x, data-y and data-z attributes
 * that will then be processed by `impress().init()`.
 * 
 * (Another name for this kind of plugin might be called a *filter plugin*, but
 * *pre-init plugin* is more generic, as a plugin might do whatever it wants in
 * the pre-init stage.)
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    /**
     * Copied from core impress.js. We currently lack a library mechanism to
     * to share utility functions like this.
     */
    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };

    /**
     * Extends toNumer() to correctly compute also relative-to-screen-size values 5w and 5h.
     *
     * Returns the computed value in pixels with w/h postfix removed.
     */
    var toNumberAdvanced = function (numeric, fallback) {
        if (!(typeof numeric == 'string')) {
            return toNumber(numeric, fallback);
        }
        var ratio = numeric.match(/^([+-]*[\d\.]+)([wh])$/);
        if (ratio == null) {
            return toNumber(numeric, fallback);
        } else {
            var value = parseFloat(ratio[1]);
            var multiplier = ratio[2] == 'w' ? window.innerWidth : window.innerHeight;
            console.log(value*multiplier);
            return value * multiplier;
        }
    };

    var computeRelativePositions = function ( el, prev ) {
        var data = el.dataset;
        
        if( !prev ) {
            // For the first step, inherit these defaults
            var prev = { x:0, y:0, z:0, relative: {x:0, y:0, z:0} };
        }

        var step = {
                x: toNumber(data.x, prev.x),
                y: toNumber(data.y, prev.y),
                z: toNumber(data.z, prev.z),
                relative: {
                    x: toNumberAdvanced(data.relX, prev.relative.x),
                    y: toNumberAdvanced(data.relY, prev.relative.y),
                    z: toNumberAdvanced(data.relZ, prev.relative.z)
                }
            };
        // Relative position is ignored/zero if absolute is given.
        // Note that this also has the effect of resetting any inherited relative values.
        if(data.x !== undefined) step.relative.x = 0;
        if(data.y !== undefined) step.relative.y = 0;
        if(data.z !== undefined) step.relative.z = 0;
        
        // Apply relative position to absolute position, if non-zero
        // Note that at this point, the relative values contain a number value of pixels.
        step.x = step.x + step.relative.x;
        step.y = step.y + step.relative.y;
        step.z = step.z + step.relative.z;
        
        return step;        
    };
            
    var rel = function() {
        var root  = document.querySelector("#impress");
        var steps = root.querySelectorAll(".step");
        var prev;
        for ( var i = 0; i < steps.length; i++ ) {
            var el = steps[i];
            var step = computeRelativePositions( el, prev );
            // Apply relative position (if non-zero)
            el.setAttribute( "data-x", step.x );
            el.setAttribute( "data-y", step.y );
            el.setAttribute( "data-z", step.z );
            prev = step;
        }
    };
    
    // Register the plugin to be called in pre-init phase
    impress().addPreInitPlugin( rel );
    
})(document, window);

