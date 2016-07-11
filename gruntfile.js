﻿/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.initConfig({
        typescript: {
            build: {
                src: ['widget/**/*.ts'],
                dest: 'dist/algorithm.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: true,
                    declaration: true
                }
            },
            tests: {
                src: ['tests/**/*.ts'],
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: true,
                    declaration: false
                }
            }
        },
        less: {
            compile: {
                files: [{
                    expand: true,
                    src: ['widget/**/*.less'],
                    ext: '.css'
                }],
                options: {
                    sourceMap: true
                }
            }
        },
        cssmin: {
            all: {
                files: {
                    'dist/algorithm.min.css': ['widget/**/*.css']
                }
            }
        },
        uglify: {
            modules: {
                files: {
                    'dist/algorithm.min.js': ['dist/algorithm.js']
                }
            }
        },
        concat: {
            templates: {
                files: {
                    'dist/algorithm.html': ['widget/**/*.html']
                }
            }
        },
        qunit: {
            all: {
                options: {
                    urls: ['tests/tests.html?coverage=true&lcovReport'],
                    noGlobals: true
                }
            }
        },
        qunit_junit: {
            options: {
                // Task-specific options go here.
            }
        },
        coveralls: {
            options: {
                force: true
            },
            all: {
                src: '_build/coverage-results/algorithm.lcov',
            }
        },
        watch: {
            styles: {
                files: ['widget/**/*.less'],
                tasks: ['less', 'cssmin:all'],
                options: {
                    nospawn: true
                }
            },
            modules: {
                files: ['widget/**/*.ts'],
                tasks: ['typescript:build', 'uglify:modules'],
                options: {
                    nospawn: true
                }
            },
            templates: {
                files: ['widget/**/*.html'],
                tasks: ['concat:templates'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('buildall', ['typescript:build', 'less:compile', 'cssmin:all', 'uglify:modules', 'concat:templates']);
    grunt.registerTask('test', ['typescript', 'qunit_junit', 'qunit:all']);

    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-open");
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-coveralls');

    grunt.event.on('qunit.report', function(data) {
        grunt.file.write('_build/coverage-results/algorithm.lcov', data);
    });

};