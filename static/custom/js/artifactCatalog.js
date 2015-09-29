// Quite a bit of the code from here was taken from Sparkl. Thanks, guys!

/********************************** Project namespace *******************************************/

// From http://stackoverflow.com/questions/610406/
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var artifactCatalog = {};
(function(myself){
    myself.pluginId = 'artifactCatalog';

    myself.pentahoPrefix = function() {
        return '/pentaho';
    }

    myself.apiPrefix = function() {
        return myself.pentahoPrefix() + '/api';
    }

    myself.pluginPrefix = function() {
        return myself.pentahoPrefix() + '/plugin';
    }

    myself.splitIdentifiers = function (s_ids) {
        if (s_ids) {
            return s_ids.split(/,/);
        } else {
            return [];
        }
    }

    /*
      Encodes the path to the resource as the Pentaho REST API expects
      it: /Public/foo.wcdf is turned into :Public:foo.wcdf.
    */
    myself.encodeResourcePath = function (path) {
	return encodeURIComponent(path.replace(/\//g, ":"));
    }

    myself.getEditURL = function (path) {
	if (path.endsWith(".wcdf")) {
	    return myself.apiPrefix() + '/repos/' + myself.encodeResourcePath(path) + '/wcdf.edit';
	}
    }

    myself.getViewURL = function (path) {
	var suffix;
	if (path.endsWith(".prpt")) {
	    suffix = "/viewer";
	}
	else if (path.endsWith(".pdf") || path.endsWith(".xls") || path.endsWith(".xlsx")) {
	    suffix = "/content";
	}
	else {
	    suffix = "/generatedContent";
	}

	return myself.apiPrefix() + '/repos/' + myself.encodeResourcePath(path) + suffix;
    }

    myself.getEndpointURL = function (name) {
        return myself.pluginPrefix() + '/' + myself.pluginId + '/api/' + name;
    }

    myself.runEndpoint = function (endpoint, opts){
	var pluginId = myself.pluginId;
	if (!endpoint) {
	    Dashboards.log('PluginId or endpointName not defined.');
	    return false;
	}

	var _opts = {
	    success: function (){
		Dashboards.log( pluginId + ': ' + endpoint + ' ran successfully.')
	    },
	    error: function (){
		Dashboards.log( pluginId + ': error running ' + endpoint + '.')
	    },
	    params: {},
	    systemParams: {'kettleOutput': 'Json'},
	    type: 'POST',
	    dataType: 'json'
	}
	var opts = $.extend( {}, _opts, opts);
	var url = Dashboards.getWebAppPath() + '/plugin/' + pluginId + '/api/' + endpoint;

	function successHandler  (json){
	    if ( json && json.result == false){
		opts.error.apply(this, arguments);
	    } else {
		opts.success.apply( this, arguments );
	    }
	}

	function errorHandler() {
	    opts.error.apply(this, arguments);
	}
	if ( endpoint != 'renderer/refresh' ) { //XXX - do this better
	    var ajaxOpts = {
		url: url,
		async: true,
		type: opts.type,
		dataType: opts.dataType,
		success: successHandler,
		error: errorHandler,
		data: {}
	    }
	} else {
	    var ajaxOpts = {
		url: url,
		async: true,
		type: 'GET',
		dataType: opts.dataType,
		success: successHandler,
		error: errorHandler,
		data: {}
	    }
	}

	_.each( opts.params , function ( value , key){
	    ajaxOpts.data['param' + key] = value;
	});
	_.each( opts.systemParams , function ( value , key){
	    ajaxOpts.data[key] = value;
	});

	$.ajax(ajaxOpts)
    }

    myself.userIsAdmin = function() {
	return Dashboards.context.isAdmin || _.contains(Dashboards.context.roles, "Administrator")
    }

    myself.i18n = function() { return {
	"sProcessing": Dashboards.i18nSupport.prop("olanguage.sProcessing"),
	"sZeroRecords": Dashboards.i18nSupport.prop("olanguage.sZeroRecords"),
	"sSearch": Dashboards.i18nSupport.prop("olanguage.sSearch"),
	// "sUrl": "",
	"oPaginate": {
	    "sFirst": Dashboards.i18nSupport.prop("olanguage.sFirst"),
	    "sPrevious": Dashboards.i18nSupport.prop("olanguage.sPrevious"),
	    "sNext": Dashboards.i18nSupport.prop("olanguage.sNext"),
	    "sLast": Dashboards.i18nSupport.prop("olanguage.sLast")
	},
	"sLengthMenu": Dashboards.i18nSupport.prop("olanguage.sLengthMenu"),
	"sInfo": Dashboards.i18nSupport.prop("olanguage.sInfo"),
	"sInfoEmpty": Dashboards.i18nSupport.prop("olanguage.sInfoEmpty"),
	"sInfoFiltered": Dashboards.i18nSupport.prop("olanguage.sInfoFiltered")
    }};

    myself.i18nSections = function() { return {
	"sProcessing": Dashboards.i18nSupport.prop("olanguage.sProcessing"),
	"sZeroRecords": Dashboards.i18nSupport.prop("ZeroSections"),
	"sSearch": Dashboards.i18nSupport.prop("olanguage.sSearch"),
	// "sUrl": "",
	"oPaginate": {
	    "sFirst": Dashboards.i18nSupport.prop("olanguage.sFirst"),
	    "sPrevious": Dashboards.i18nSupport.prop("olanguage.sPrevious"),
	    "sNext": Dashboards.i18nSupport.prop("olanguage.sNext"),
	    "sLast": Dashboards.i18nSupport.prop("olanguage.sLast")
	} ,
	"sLengthMenu": Dashboards.i18nSupport.prop("olanguage.sLengthMenu"),
	"sInfo": Dashboards.i18nSupport.prop("olanguage.sInfo"),
	"sInfoEmpty": Dashboards.i18nSupport.prop("olanguage.sInfoEmpty"),
	"sInfoFiltered": Dashboards.i18nSupport.prop("olanguage.sInfoFiltered")
    }};

})(artifactCatalog);

/************************************  AddIns ************************************/

;(function (){
    var actionButtonsOpts = {
	name: "actionButtons",
	label: "Action Buttons",
	defaults: {
	    buttons: []
	},

	init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
	},
	
	implementation: function(tgt, st, opt){
	    var $buttonContainer = $('<div/>').addClass('buttonContainer')
		.addClass('numButtons-' + opt.buttons.length);
	    _.each(opt.buttons, function(el,idx){
		var $button = $("<button/>").addClass(el.cssClass||"").text(el.title||"").attr('title', el.tooltip||"");
		$button.click(function(){
		    if (el.action) {
			el.action(st.value, st);
		    }
		});
		$buttonContainer.append($button);
	    });
	    $(tgt).empty().append($buttonContainer);

	}

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(actionButtonsOpts));
    
    /* edit data of table  */
    var editable = {
	name: "editable",
	label: "Editable",
	defaults: {
	    action: function (v, st) {
		Dashboards.log(v);
	    }
	},
	init: function(){
	    // Register this for datatables sort
	    var myself = this;
	    $.fn.dataTableExt.oSort[this.name+'-asc'] = function(a,b){
		return myself.sort(a,b)
	    };
	    $.fn.dataTableExt.oSort[this.name+'-desc'] = function(a,b){
		return myself.sort(b,a)
	    };   
	}, 
	sort: function(a,b){
	    return this.sumStrArray(a) - this.sumStrArray(b);
	}, 

	implementation: function (tgt, st, opt) {
	    var t = $(tgt);
	    var value = st.value;
	    var text = $("<input/>").attr("value", value).attr("type", "text").attr("class", "editBox")
		.keyup(function(event){
		    if (event.keyCode == 13) {
			opt.action( $(this).val(), st );
		    }
		    /*var idx = this.parentNode.parentNode.rowIndex;
		      metadataParam[idx-1][1] = $(this).val();*/
		    var obj = this.parentNode.parentNode.children[0].textContent;
		    metadataParam[obj.toString()] = $(this).val();
		});
	    
	    t.empty();
	    t.append(text);
	}
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(editable));

    /* Apply classes specified by a function to cell. */
    var condclass = {
	name: "condclass",
	label: "Conditional Class",
	defaults: {
	    condition: function(t, st) {
		return "condclass";
	    }
	},
	init: function(){
	    // nothing to do yet
	}, 
	implementation: function(tgt, st, opt) {
	    var t = $(tgt);
	    t.removeClass(this.name);

	    var newClass = opt.condition(tgt, st);
	    if (newClass) {
		t.addClass(newClass);
	    }
	},
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(condclass));

    /* Apply styles to cell specified by a function. */
    var condstyles = {
	name: "condstyles",
	label: "Conditional Styles",
	defaults: {
	    condition: function(t, st) {
		return {color: red};
	    }
	},
	init: function(){
	    // nothing to do yet
	}, 
	implementation: function(tgt, st, opt) {
	    var t = $(tgt);
	    t.removeClass(this.name);

	    var styles = opt.condition(tgt, st);
	    if (styles) {
                for (k in styles) {
		    t.css(k, styles[k]);
                }
	    }
	},
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(condstyles));

    /* Use the value of the cell as a background image. */
    var background = {
	name: "background",
	label: "Background",
	defaults: {
            // no options to set
	},
	init: function(){
	    // nothing to do yet
	}, 
	implementation: function(tgt, st, opt) {
            var url = st.value;
	    var t = $(tgt);
	    t.html("");
            t.css("background-image", "url(" + encodeURI(url) + ")");
	},
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(background));

    /* Fill empty cells with a certain HTML fragment. */
    var htmlifempty = {
	name: "htmlifempty",
	label: "HTML If Empty",
	defaults: {
	    html: function(tgt, st) {
		return "add";
	    },
	},
	init: function(){
	    // Register this for datatables sort
	    var myself = this;
	    $.fn.dataTableExt.oSort[this.name+'-asc'] = function(a,b){
		return myself.sort(a, b);
	    };
	    $.fn.dataTableExt.oSort[this.name+'-desc'] = function(a,b){
		return myself.sort(b, a);
	    };
	},
	sort: function(a, b) {
	    return a == b ? 0 : (a < b ? -1 : 1);
	},
	implementation: function(tgt, st, opt) {
	    var t = $(tgt);
	    t.text() || t.text(opt.html(tgt, st));
	},
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(htmlifempty));
})();
