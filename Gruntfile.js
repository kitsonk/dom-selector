/* jshint node:true */

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('intern');

	grunt.initConfig({
		ts: {
			options: {
				failOnTypeErrors: true,
				fast: process.env.CONTINUOUS_INTEGRATION ? 'never' : 'watch',
				module: 'commonjs',
				noImplicitAny: true,
				sourceMap: true,
				target: 'es5'
			},

			default: {
				src: [ '**/*.ts', '!**/*.d.ts', '!tests/**/*.ts', '!node_modules/**/*.ts' ],
				watch: '.'
			},

			tests: {
				options: {
					module: 'amd'
				},
				src: [ 'tests/**/*.ts' ]
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

	grunt.registerTask('ci', [ 'ts:tests', 'test:client', 'test:runner' ]);
};
