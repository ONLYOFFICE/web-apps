/**
 * User: Julia.Radzhabova
 * Date: 05.03.15
 * Time: 17:05
 */

if (Common === undefined)
    var Common = {};

Common.Collections = Common.Collections || {};

define([
    'underscore',
    'backbone',
    'common/main/lib/model/HistoryVersion'
], function(_, Backbone){
    'use strict';

    Common.Collections.HistoryVersions = Backbone.Collection.extend({
        model: Common.Models.HistoryVersion,

        findRevision: function(revision) {
            return this.findWhere({revision: revision});
        },

        findRevisions: function(revision) {
            return this.where({revision: revision});
        }
    });
});
