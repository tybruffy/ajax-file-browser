jQuery(document).ready(function($) {

	$(".file-browser")
		.click(function() {
			var path      = $(this).data("path"),
				url       = $(this).data("url"),
				field     = $(this).data("linked-field"),
				container = create_element( "div", "", { "id" : "tb-file-browser", "data-linked-field": field, "data-basepath": path, "data-baseurl": url }),
				overlay   = create_element( "div", "", { "id": "tb-fb-overlay" });

			$("body").append(overlay);
			$("body").append(container);

			pull_file_list( path );
		});

	$(document).on("click", ".directory-link", function(){
		pull_file_list( $(this).data("directory") );
	});

	$(document).on("click", ".file-link", function(){
		var file     = $(this).data("file"),
			field    = $("#tb-file-browser").data("linked-field"),
			basepath = $("#tb-file-browser").data("basepath"),
			baseurl  = $("#tb-file-browser").data("baseurl");
		
		use_file( file, field, basepath, baseurl );
		$("#tb-fb-overlay").remove();
		$("#tb-file-browser").remove();
	});

	$(document).on("click", "#tb-fb-overlay", function(){
		$(this).remove();
		$("#tb-file-browser").remove();
	});


});

function pull_file_list( start_path ) {
	jQuery.ajax({
		url      : tbfb_script_url,
		dataType : "json",
		data     : {
			path : start_path,
			output : "json",
		},
		
		success : function( data ) {
			var lists = get_lists( data );
			jQuery("#tb-file-browser").empty().append(lists);
		},

		error : function( data ) {
			console.log(data);
		}
	});
}


function _path_to_url( path, basepath, baseurl ) {
	var url_file = path.toLowerCase().split(basepath.toLowerCase()),
		url = baseurl + url_file[url_file.length-1];
	return url
}



function get_lists( data ) {
	var dir_items  = get_list_items( data.directories, "directory" ),
		file_items = get_list_items( data.files, "file" ),
		dir_list  = create_element( "ul", dir_items+file_items, { "class":"directory-list"} );

	return dir_list;
}


function get_list_items( array, title ) {
	var output ="";
	jQuery.each( array, function(index, file) {
		var attr = {
			"class" : title+"-link",
			"href"  : "#"
		}
		attr["data-"+title] = file.path;
		var link = create_element( "a", file.name, attr );
		output += create_element( "li", link, { "class": title });
	});
	return output;
}


function use_file( filename, field, basepath, baseurl ) {
	var url = _path_to_url( filename, basepath, baseurl );

	jQuery(field).val( filename );
	jQuery(field +"-url").val( url );
}






function create_element ( el, content, attribute_obj ) {
	var attributes = [];
	if ( attribute_obj !== undefined ) {
		for ( key in attribute_obj ) {
			attributes.push( key +'="'+ attribute_obj[key] +'"' );
		}
		attribute_list = attributes.join( ' ' );
	} else {
		attribute_list = '';
	}

	switch ( el ) {
		case 'area':
		case 'base':
		case 'br':
		case 'col':
		case 'command':
		case 'embed':
		case 'hr':
		case 'img':
		case 'input':
		case 'link':
		case 'meta':
		case 'param':
		case 'source':
		case 'track':
		case 'wbr':
			ret = '<' +el+ ' ' +attribute_list+ '/>';
			break;
		default:
			ret = '<' +el+ ' ' +attribute_list+ '>' +content+ '</' +el+ '>';
			break;
	}

	return ret;
}