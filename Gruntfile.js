module.exports = function (grunt) {

	grunt.initConfig({

		clean: {
			dist: ['dist']
		},

		concat: {
			dist: {
				files: {
					'dist/jquery.slideprojector.js': 'src/plugin.js',
					'dist/jquery.slideprojector.fade.js': 'src/fade.js',
					'dist/jquery.slideprojector.poproll.js': 'src/poproll.js',
					'dist/jquery.slideprojector.slide.js': 'src/slide.js',
					'dist/jquery.slideprojector.full.js': [
						'src/plugin.js',
						'src/fade.js',
						'src/poproll.js',
						'src/slide.js'
					],
				}
			}
		},

		uglify: {
			dist: {
				files: [{
					expand: true,
					cwd: 'dist',
					src: '*.js',
					dest: 'dist/min'
				}]
			}
		}

	});

	require('load-grunt-tasks')(grunt);
	grunt.registerTask('delete', ['clean:dist']);
	grunt.registerTask('build', ['concat:dist', 'uglify:dist']);
};
