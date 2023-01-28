#!/bin/bash

mega-login "$1" "$2" && mega-put "$3" && mega-mv "$4" "$5" && mega-import "$6" && mega-mv "$5" files/ && mega-export -a -f files && mega-logout && mega-quit