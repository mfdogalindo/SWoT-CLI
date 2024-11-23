# setup.py
from setuptools import setup, find_packages

setup(
    name="semantic-api",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},

    # Dependencias requeridas
    install_requires=[
        # Core dependencies
        "Flask>=3.1.0",
        "python-dotenv>=1.0.0",
        "fastapi>=0.104.1",
        "pydantic>=2.5.2",
        "pydantic-settings>=2.1.0",
        "rdflib>=7.0.0",
        "requests>=2.31.0",
        # Type hints support
        "types-requests>=2.31.0.10",
    ],

    # Dependencias opcionales para desarrollo
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "mypy>=1.7.0",
            "black>=23.11.0",
            "flake8>=6.1.0",
            "isort>=5.12.0",
        ],
    },

    # Metadatos del proyecto
    author="Your Name",
    author_email="your.email@example.com",
    description="Semantic Mapper for IoT Sensor Data",
    url="https://github.com/yourusername/semantic-api",
    # Clasificadores del proyecto
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Scientific/Engineering :: Information Analysis",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],

    # Requerimientos del proyecto
    python_requires=">=3.8",

    # Entradas de consola
    entry_points={
        "console_scripts": [
            "semantic-api=semantic_api.main:main",
        ],
    },

    # Incluir archivos no Python
    package_data={
        "semantic_api": ["py.typed"],
    },
    include_package_data=True,
)
