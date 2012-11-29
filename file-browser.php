<?php

class File_Browser {
	private $start_path;
	private $output_type;
	private $error_message;
	private $directories = array();
	private $files = array();


	function __construct() {
		$this->_set_start_path();
		$this->_set_output_type();

		$directory = $this->directory_check( $this->start_path );
		$directory_handle = $this->directory_handle_check( $this->start_path );

		if ( ! $directory || ! $directory_handle ) {
			$this->error_output();
		} else {
			$this->_output( $this->output_type );
		}
	}


	private function _set_start_path() {
		if ( ! empty($_REQUEST[ "path" ]) ) {
			$path = $_REQUEST[ "path" ];
		} else {
			$path = pathinfo( __FILE__ );
			$path = $path[ "dirname" ];
		}
		$this->start_path = $path;
	}


	private function _set_output_type() {
		if ( ! empty($_REQUEST[ "output" ]) ) {
			$output = $_REQUEST[ "output" ];
		} else {
			$output = "html";
		}
		$this->output_type = $output;
	}

	private function _output( $type ) {
		if ( $type == "json" ) {
			echo $this->json_output();
		} else {
			echo $this->html_output();
		}
	}


	private function directory_check( $dir ) {
		if ( is_dir( $dir ) ) {
			return true;
		}
		else {
			$this->error_message = 'Path is not a directory';
			return false;
		}	
	}


	private function directory_handle_check( $dir ) {
		chdir( $dir );
		$handle_check = $this->check_handle();
		return $handle_check;
	}

	private function check_handle() {
		if ( $handle = opendir('.') ) {
			$this->read_directory( $handle );
			closedir( $handle ); 
			return true;
		}
		else {
			$this->error_message = 'Directory handle could not be obtained.';
			return false;
		}
	}


	private function read_directory( $handle ) {
		while (( $item = readdir($handle) ) !== false) {
			$this->push_paths( $item );
		}
	}

 
	function push_paths( $item ) {
		if ( preg_match("/^\./", $item ) && $item != ".." ) { 
			return;
		} elseif( is_dir( $item ) ) {
			$this->directories[$item] = realpath( $item );
		} else {
			$this->files[$item] = realpath( $item );
		}
	}


	private function json_output() {
		$directories = $this->create_js_array( $this->directories );
		$files = $this->create_js_array( $this->files );

		$output = '{';

		$output .= ' "directories" : [' .$directories . '],';
		$output .= ' "files" : [' .$files . ']';

		$output .= '}';

		return $output;
	}


	private function create_js_array( $array ) {
		$arr = array();
		foreach( $array as $index => $value ) {
			array_push($arr, $this->create_js_object( $index, $value ) );
		}
		return implode(", ", $arr);
	}


	private function create_js_object( $key, $value ) {
		return '{"name":"'.$key.'", "path": "'.$value.'"}';
	}


	private function html_output() {		
		$directories = $this->create_html_list( $this->directories, "directory" );
		$files = $this->create_html_list( $this->files, "file" );

		$output = sprintf('<ul class="directory-list">%s</ul>',
			$directories.$files);
		echo $output;
	}


	private function create_html_list( $array, $title ) {
		$output = "";
		foreach( $array as $name => $path ) {
			$output .= sprintf('<li class="%s"><a href="#" class="%s-link" data-%s="%s">%s</a></li>',
					$title,
					$title,
					$title,
					$path,
					$name
				);
		}
		return $output;
	}


}

new File_Browser();

?>