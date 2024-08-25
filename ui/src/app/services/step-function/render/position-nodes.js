"use strict";
import * as d3 from "d3";

var util = require("./util");

module.exports = positionNodes;

function positionNodes(selection, g) {
  var created = selection.filter(function () {
    return !d3.select(this).classed("update");
  });

  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g).style("opacity", 1).attr("transform", translate);
}
