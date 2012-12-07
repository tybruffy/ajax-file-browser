(function( $ ){

	var pluginName = 'serverBrowser',
		defaults = {
			ajax_url : '/browser.class.php',

			success  : function( data ) {
				var lists     = methods.sort_data( data );
				var	list_html = methods._get_list_html( lists );

				$(".tb-file-browser").html( list_html );
			},
			error: function( data ) {
				console.log(data)
			}
		};

	var methods = {
		browse: function( ajax_url, path_root, web_root, success_cb, error_cb ) {
			 return $.ajax({
				url      : ajax_url,
				dataType : "json",
				data     : {
					path     : path_root,
					web_root : web_root
				},

				success: function ( data ) {
					success_cb( data );
				},
				error: function (data) {
					error_cb( data );
				}
			});
		},

		sort_data: function( list ) {
			var obj = { directory: [], file: [] };
			$.each( list, function(index, file) {
				obj[file.type].push( file );
			});

			return { directories: obj["directory"], files: obj["file"] }
		},

		return_data: function ( return_obj, file ) {
			if ( $.isEmptyObject( return_obj ) ) {
				return file;
			} else {
				methods.set_values( return_obj, file );
				return true;
			}
		},

		set_values: function ( return_obj, file ) {
			for ( prop in return_obj ) {
				var field = $( return_obj[prop] );
				if ( field.is("input") ) {
					field.val( file[prop] );
				} else {
					field.text( file[prop] );
				}
			}
		},

		_bind_click_events: function( options ) {
			$(document).on("click", ".directory-link", function(){
				var info = $(this).data("file")
				var test = methods.browse( options.ajax_url, info.path, info.url, options.success, options.error );
			});

			$(document).on("click", ".file-link", function(){
				methods.return_data( options.return_ids, $(this).data("file") );
				$(".tb-fb-overlay").remove();
				$(".tb-file-browser").remove();
			});

		},

		_get_list_items_html: function ( file_obj ) {
			var link      = $('<a href="#">').addClass(file_obj.type+'-link').data("file", file_obj).html(file_obj.name);
			var list_item = $("<li>").addClass(file_obj.type).html( link );
			return list_item;
		},

		_get_list_html: function ( lists_obj ) {
			var html = $( "<ul>" ).addClass("directory-list");

			$.each( lists_obj.directories, function( index, dir ) {
				dir_html = methods._get_list_items_html( dir );
				dir_html.appendTo( html );
			});

			$.each( lists_obj.files, function( index, file ) {
				dir_html = methods._get_list_items_html( file );
				dir_html.appendTo( html );
			});

			return html;
		},

	};

	function Plugin( element, options ){

		this.element = element;

		this.options = $.extend( {}, defaults, options);
		this.methods = methods;

		this._defaults = defaults;
		this._name = pluginName;

		var instance = this;
		
		this.init();
	}

	Plugin.prototype.init = function () {
		$('<div class="tb-file-browser">').prependTo("body");
		
		$('<div class="tb-fb-overlay">')
			.prependTo("body")
			.click(function() {
				$(this).remove();
				$(".tb-file-browser").remove();			
			});

		this.methods._bind_click_events( this.options );

		this.methods.browse( this.options.ajax_url, this.options.root_path, this.options.root_url, this.options.success, this.options.error );




	};

	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, 
				new Plugin( this, options ));
			}
		});
	}

})( jQuery );
 



jQuery(document).ready(function($) { 

	$(".file-browser")
		.click(function() {

			$(this).serverBrowser({
				ajax_url  : 'http://wp.testing.com/wp-content/plugins/wp-less-compiler/lib/file-browser/browser.class.php', 
				root_path   : $(this).data("path"),
				root_url    : $(this).data("url"),
				return_ids  : {
					path : $(this).data("linked-path-field"),
					url  : $(this).data("linked-url-field")
				}
			});

		});	
});











