/* jshint node:true */

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('intern');

	grunt.initConfig({
		ts: {
			options: {
				failOnTypeErrors: true,
				fast: 'never',
				noImplicitAny: true,
				sourceMap: true,
				target: 'es5'
			},
			amd: {
				options: {
					module: 'amd'
				},
				outDir: 'dist',
				src: [ '<%= all %>' ]
			},
			amdLoader: {
				options: {
					module: 'commonjs'
				},
				outDir: 'dist',
				src: [ 'src/loader.ts' ]
			},
			cjs: {
				options: {
					module: 'commonjs'
				},
				outDir: 'dist',
				src: [ '<%= all %>' ]
			},
			tests: {
				options: {
					module: 'amd'
				},
				src: [ 'tests/**/*.ts', 'typings/tsd.d.ts' ]
			}
		},

		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json')
			},
			dojo: {
				src: [ '<%= all %>' ]
			}
		},

		intern: {
			client: {
				options: {
					runType: 'client',
					config: 'tests/intern'
				}
			},
			runner: {
				options: {
					runType: 'runner',
					config: 'tests/intern'
				}
			}
		}
	});

	grunt.registerTask('test', function (target) {
		if (!target) {
			target = 'remote';
		}

		function addReporter(reporter) {
			var property = 'intern.' + target + '.options.reporters',
				value = grunt.config.get(property);

			if (value.indexOf(reporter) !== -1) {
				return;
			}

			value.push(reporter);
			grunt.config.set(property, value);
		}

		if (this.flags.coverage) {
			addReporter('lcovhtml');
		}
		if (this.flags.console) {
			addReporter('console');
		}

		grunt.task.run('ts:tests');
		grunt.task.run('intern:' + target);
	});

	grunt.registerTask('build', function (moduleType) {
		// Use `build:<moduleType>` to build Dojo 2 core using a different module type than the default
		if (moduleType) {
			grunt.config.set('ts.default.module', moduleType);
		}

		grunt.task.run('ts:default', 'ts:tests');
	});

	grunt.registerTask('default', [ 'ts:default' ]);

	grunt.registerTask('ci', [ 'ts:tests', 'intern:client', 'intern:runner' ]);
};
