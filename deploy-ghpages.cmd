rmdir out /s /y

md out
cd out
md dist
copy ..\dist\*.* .\dist\*.*


git init
git config user.name "tsv2013"
rem git config user.email "noreply@home.org"

git add .\dist\*.*
git commit -m "Deployed to Github Pages"
git push --force "https://github.com/tsv2013/algorithm.git" master:gh-pages
