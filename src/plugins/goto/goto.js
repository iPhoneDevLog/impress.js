/**
 * Goto Plugin
 *
 * The goto plugin is a pre-stepleave plugin. It is executed before impress:stepleave,
 * and will alter the destination where to transition next.
 *
 * Example:
 * 
 *         <!-- When leaving this step, go directly to "step-5" -->
 *         <div class="step" data-goto="step-5">
 * 
 *         <!-- When leaving this step with next(), go directly to "step-5", instead of the next step.
 *              If moving backwards to previous step - e.g. prev() instead of next() - then go to "step-1". -->
 *         <div class="step" data-goto-next="step-5" data-goto-prev="step-1">
 *
 *        <!-- data-goto-key-list and data-goto-next-list allow you to build advanced non-linear navigation. -->
 *        <div class="step" data-goto-key-list="ArrowUp ArrowDown ArrowRight ArrowLeft" data-goto-next-list="step-4 step-3 step-2 step-5">
 * 
 * Copyright 2016-2017 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    var isNumber = function (numeric) {
        return !isNaN(numeric);
    };
    
    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };

    var goto = function(event) {
        if ( (!event) || (!event.target) )
            return;
        
        var data = event.target.dataset;
        var steps = document.querySelectorAll(".step");
        
        // data-goto-key-list="" & data-goto-next-list="" ///////////////////////////////////////////
        if ( data.gotoKeyList !== undefined &&
             data.gotoNextList !== undefined &&
             event.origEvent !== undefined &&
             event.origEvent.key !== undefined ) {
            var keylist = data.gotoKeyList.split(" ");
            var nextlist = data.gotoNextList.split(" ");

            if ( keylist.length != nextlist.length ) {
                console.log("impress goto plugin: data-goto-key-list and data-goto-next-list don't match:");
                console.log(keylist);
                console.log(nextlist);
                // Don't return, allow the other categories to work despite this error
            }
            else {
                var index = keylist.indexOf(event.origEvent.key);
                if ( index >= 0 ) {
                    var next = nextlist[index];
                    if ( isNumber(next) ){
                        event.detail.next = steps[next];
                        // If the new next element has its own transitionDuration, we're responsible for setting that on the event as well
                        event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                        return;
                    }
                    else {
                        var newTarget = document.getElementById( next );
                        if ( newTarget && newTarget.classList.contains("step") ) {
                            event.detail.next = newTarget;
                            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                            return;
                        }
                        else {
                            console.log( "impress goto plugin: " + next + " is not a step in this impress presentation.");
                        }
                    }
                }
            }
        }

        // data-goto-next="" & data-goto-prev="" ///////////////////////////////////////////////////

        // Handle event.target data-goto-next attribute
        if ( isNumber(data.gotoNext) && event.detail.reason == "next" ) {
            event.detail.next = steps[data.gotoNext];
            // If the new next element has its own transitionDuration, we're responsible for setting that on the event as well
            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
            return;
        }
        if ( data.gotoNext && event.detail.reason == "next" ) {
            var newTarget = document.getElementById( data.gotoNext );
            if ( newTarget && newTarget.classList.contains("step") ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                return;
            }
            else {
                console.log( "impress goto plugin: " + data.gotoNext + " is not a step in this impress presentation.");
            }
        }

        // Handle event.target data-goto-prev attribute
        if ( isNumber(data.gotoPrev) && event.detail.reason == "prev" ) {
            event.detail.next = steps[data.gotoPrev];
            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
            return;
        }
        if ( data.gotoPrev && event.detail.reason == "prev" ) {
            var newTarget = document.getElementById( data.gotoPrev );
            if ( newTarget && newTarget.classList.contains("step") ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                return;
            }
            else {
                console.log( "impress goto plugin: " + data.gotoPrev + " is not a step in this impress presentation.");
            }
        }

        // data-goto="" ///////////////////////////////////////////////////////////////////////////

        // Handle event.target data-goto attribute
        if ( isNumber(data.goto) ) {
            event.detail.next = steps[data.goto];
            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
            return;
        }
        if ( data.goto ) {
            var newTarget = document.getElementById( data.goto );
            if ( newTarget && newTarget.classList.contains("step") ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                return;
            }
            else {
                console.log( "impress goto plugin: " + data.goto + " is not a step in this impress presentation.");
            }
        }
    };
    
    // Register the plugin to be called in pre-stepleave phase
    impress.addPreStepLeavePlugin( goto );
    
})(document, window);

