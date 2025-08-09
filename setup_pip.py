from setuptools import setup, find_packages
import os

# Read README for long description
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements
with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="git-nacht",
    version="1.0.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="Visual patch notes CLI that captures screenshots on git commits",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/git-nacht",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Version Control :: Git",
        "Topic :: Multimedia :: Graphics :: Capture :: Screen Capture",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "git-nacht=src.cli.main:cli",
            "gitnacht=src.cli.main:cli",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.md", "*.txt", "*.example"],
    },
    project_urls={
        "Bug Reports": "https://github.com/yourusername/git-nacht/issues",
        "Source": "https://github.com/yourusername/git-nacht",
        "Documentation": "https://github.com/yourusername/git-nacht#readme",
    },
)
