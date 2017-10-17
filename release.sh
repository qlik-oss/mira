#!/bin/bash

set -e

REPO=qlik-ea/mira

function pre_flight_checks() {
  if [[ ! -z $(git status --porcelain) ]]; then
    echo "There are uncommitted changes. Please make sure branch is clean."
    exit 1
  fi

  if [ "$GITHUB_API_TOKEN" == "" ]; then
    echo "No GITHUB_API_TOKEN found - this must be set!"
    exit 1
  fi
}

function check_release_type() {
  if [ "$RELEASE_TYPE" == "" ]; then
    echo "No RELEASE_TYPE specified - assuming patch"
    export RELEASE_TYPE=patch
  fi

  if [ "$RELEASE_TYPE" != patch ] && [ "$RELEASE_TYPE" != minor ] && [ "$RELEASE_TYPE" != major ]; then
    echo "Invalid RELEASE_TYPE specified"
    exit 1
  fi
}

function generate_change_log() {
  echo "Generating changelog..."
  github_changelog_generator --exclude-labels duplicate,question,invalid,wontfix,admin --max-issues 200
  git add CHANGELOG.md
  git commit -m "Change Log [ci skip]"
  git push
  echo "Pushing changelog to github release..."
  chandler push v$RELEASE_VERSION
}

function set_github_tokens() {
  export CHANGELOG_GITHUB_TOKEN=$GITHUB_API_TOKEN
  export CHANDLER_GITHUB_API_TOKEN=$GITHUB_API_TOKEN
}

## Now do the thing
pre_flight_checks
check_release_type
set_github_tokens

if [ -f package.json ]; then
  VERSION=$(node -e "console.log(require('./package.json').version)")
  USING_NPM=true
elif [ -f version.txt ]; then
  VERSION=$(cat version.txt)
  USING_VERSIONFILE=true
elif [ -f Makefile ]; then
  # Figure out if we have a target to make version.txt
  if (make -qp | awk -F':' '/^[a-zA-Z0-9][^$#\/\t=]*:([^=]|$)/ {split($1,A,/ /);for(i in A)print A[i]}' | sort -u | grep version.txt &>/dev/null); then
    make version.txt
    VERSION=$(cat version.txt)
    USING_VERSIONLESS=true
  fi
fi

if [ -z "$VERSION" ]; then
  echo "Unable to determine current version."
  echo "You need either a package.json or a version.txt (or a 'version.txt' Makefile target)."
  exit 1
fi

# Figure out current release without prerelease
VERSION_NOPRERELEASE=$(echo $VERSION | sed -E 's/-[0-9A-Za-z.-]+$//' )

# Split by period into an array
RELEASE_PARTS=( ${VERSION_NOPRERELEASE//./ } )

# For major and minor releases increment by 1 and set following positions to 0
case "$RELEASE_TYPE" in
  major) (( RELEASE_PARTS[0] += 1))
          RELEASE_PARTS[1]=0
          RELEASE_PARTS[2]=0
      ;;
  minor) (( RELEASE_PARTS[1] += 1))
          RELEASE_PARTS[2]=0
      ;;
esac
RELEASE_VERSION="${RELEASE_PARTS[0]}.${RELEASE_PARTS[1]}.${RELEASE_PARTS[2]}"
echo "Current version is: ${VERSION}, releasing ${RELEASE_VERSION}"

# If the current version is a pre-release, bump it to a release first.
if (echo $VERSION | egrep -- '-[0-9A-Za-z.-]+$' 1> /dev/null ); then
  if [ -n "$USING_NPM" ]; then
    npm version $RELEASE_TYPE -m "Releasing v%s"
  else
    git commit --allow-empty -m "Releasing v${RELEASE_VERSION}"
    git tag -a v${RELEASE_VERSION} -m "Releasing v${RELEASE_VERSION}" || enable_status_checks
  fi
  git push
  git push --tags
else
  git tag -a v$VERSION -m "Releasing v$VERSION" || enable_status_checks
  git push
  git push --tags || enable_status_checks
fi

if [ -n "$USING_NPM" ]; then
  NEWVER=$(npm version prerelease -m "Beginning development on v%s [ci skip]")
  echo "Beginning development on next version (${NEWVER})..."
  git tag -d $NEWVER
  git push
elif [ -n "$USING_VERSIONFILE" ]; then
  # Increment the patch-level number
  (( RELEASE_PARTS[2] += 1 ))
  NEWVER="${RELEASE_PARTS[0]}.${RELEASE_PARTS[1]}.${RELEASE_PARTS[2]}-0"
  echo $NEWVER > version.txt
  echo "Beginning development on next version (${NEWVER})..."
  git add version.txt
  git commit -m "Beginning development on v${NEWVER} [ci skip]"
  git push
fi

generate_change_log
echo "Done."
