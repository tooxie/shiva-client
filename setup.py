#!/usr/bin/env python
# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

setup(
    name='shiva-client',
    version='0.3',
    description='Client for shiva-server',
    author=u'Alvaro Mouriño',
    author_email='alvaro@mourino.net',
    url='https://github.com/tooxie/shiva-client',
    package_dir={'': '.'},
    packages=find_packages('.'),
    install_requires=[
        'Flask==0.9',
    ],
    entry_points={
        'console_scripts': [
            'shiva-client = shiva.server:main'
        ]
    }
)
