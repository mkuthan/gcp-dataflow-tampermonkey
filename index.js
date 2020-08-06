// ==UserScript==
// @name         GCP Dataflow - job bottlenecks view
// @description  GCP Dataflow UI extension for finding job bottlenecks
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Tomasz Nurkiewicz, Marcin Kuthan
// @match        https://console.cloud.google.com/dataflow/jobs/*/*
// @grant        none
// @homepage     https://github.com/mkuthan/gcp-dataflow-tampermonkey
// ==/UserScript==

(function() {
    'use strict';

    const duration = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig

	parseDuration.nanosecond =
	parseDuration.ns = 1 / 1e6

	parseDuration.μs =
	parseDuration.microsecond = 1 / 1e3

	parseDuration.millisecond =
	parseDuration.ms = 1

	parseDuration.second =
	parseDuration.sec =
	parseDuration.s = parseDuration.ms * 1000

	parseDuration.minute =
	parseDuration.min =
	parseDuration.m = parseDuration.s * 60

	parseDuration.hour =
	parseDuration.hr =
	parseDuration.h = parseDuration.m * 60

	parseDuration.day =
	parseDuration.d = parseDuration.h * 24

	parseDuration.week =
	parseDuration.wk =
	parseDuration.w = parseDuration.d * 7

	parseDuration.b =
	parseDuration.month = parseDuration.d * (365.25 / 12)

	parseDuration.year =
	parseDuration.yr =
	parseDuration.y = parseDuration.d * 365.25


	function parseDuration(str){
	  var result = 0
	  // ignore commas
	  str = str.replace(/(\d),(\d)/g, '$1$2')
	  str.replace(duration, function(_, n, units){
	    units = parseDuration[units]
	      || parseDuration[units.toLowerCase().replace(/s$/, '')]
	      || 1
	    result += parseFloat(n, 10) * units
	  })
	  return result
	}

    function colorDurations() {
	    const steps = Array
	        .from(document.getElementsByClassName('df-step-msecs ng-star-inserted'))
	        .map(label => ({label, duration: parseDuration(label.innerText)}))
	    const max = Math.log(Math.max.apply(Math, steps.map(x => x.duration)))
	    steps.forEach(e => {
	    	const duration = e.duration > 0 ? Math.log(e.duration) : 0
            e.label.style['background-color'] = 'hsl(' + (1 - duration / max) * 120 + ', 80%, 50%)';
        });
    }

    function parseThroughput(str) {
        const regex = /([0-9,]+) elements\/s/g;
        const found = regex.exec(str);
        return (found && parseInt(found[1].replace(/,/g,""), 10)) || 0;
    }

    function colorThroughput() {
	    const steps = Array
	        .from(document.getElementsByClassName('df-step-metrics'))
	        .map(label => ({label, throughput: parseThroughput(label.innerText)}))
	    const max = Math.log(Math.max.apply(Math, steps.map(x => x.throughput)))
        if(max > 0) {
            steps.forEach(e => {
            	const throughput = e.throughput > 0 ? Math.log(e.throughput): 0
                e.label.style['font-size'] = (100 + (throughput / max) * 75) + '%';
                e.label.style['color'] = 'hsl(' + (220 - throughput / max * 220) + ', 80%, 50%)';
            });
        }
    }

	setInterval(() => {
        colorDurations();
        colorThroughput();
	    }, 1000);
	})();