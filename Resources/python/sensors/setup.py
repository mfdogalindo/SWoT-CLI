# setup.py
from setuptools import setup, find_packages

setup(
    name="sensors",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "paho-mqtt>=1.6.1",
        "python-dotenv>=1.0.0",
        "dataclasses-json>=0.6.1",
        "structlog>=24.1.0",
    ],
    extras_require={
        "dev": [
            "pytest>=8.0.0",
            "pytest-cov>=4.1.0",
            "black>=24.1.1",
            "isort>=5.13.2",
            "mypy>=1.8.0",
            "flake8>=7.0.0",
            "pylint>=3.0.3",
        ],
    },
    python_requires=">=3.8",
    author="Your Name",
    author_email="your.email@example.com",
    description="A Smart City Sensor Simulator",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT-NC License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
