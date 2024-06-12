const dotenv = require('dotenv');
const axios = require('axios')
const fs=require("fs")
dotenv.config();

exports.createStorageZone = async (zoneName) => {
    try {
        const url = 'https://api.bunny.net/storagezone';
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                AccessKey: "77fef308-e724-4562-ad1f-535dd7c30fd6e9e6d59e-e166-441f-bc2e-d097dd56f253"
            },
            body: JSON.stringify({
                Name: zoneName,
                ZoneTier: 0, // Assuming default tier, adjust as needed
                Region: 'DE' // Assuming a specific region, adjust as needed
            })
        };

        const response = await fetch(url, options);
        const data = await response.json();

        if (response.status === 201) {
            return { success: true, message: 'Storage zone created successfully', data: data };
        } else {
            return { success: false, message: data.Message || response.statusText };
        }
    } catch (error) {
        console.error('Error creating storage zone:', error.message);
        return { success: false, message: 'Error creating storage zone' };
    }
}

exports.createPullZone = async (zoneName, originUrl) => {
    try {
        const response = await axios.post('https://bunnycdn.com/api/pullzone', {
            Name: zoneName,
            OriginUrl: originUrl,
            StorageZoneId: null // This should be set if you have an existing storage zone
        }, {
            headers: {
                'AccessKey': "77fef308-e724-4562-ad1f-535dd7c30fd6e9e6d59e-e166-441f-bc2e-d097dd56f253"
            }
        });

        if (response.status === 201) {
            return { success: true, message: 'Pull zone created successfully', data: response.data };
        } else {
            return { success: false, message: response.statusText };
        }
    } catch (error) {
        console.error('Error creating pull zone:', error.message);
        throw error;
    }
};

exports.deleteStorageZone = async (zoneId) => {
    try {
        const url = `https://api.bunny.net/storagezone/${zoneId}`;
        const response = await axios.delete(url, {
            headers: {
                'AccessKey': "77fef308-e724-4562-ad1f-535dd7c30fd6e9e6d59e-e166-441f-bc2e-d097dd56f253",
                'Accept': 'application/json'
            }
        });

        if (response.status === 200) {
            return { success: true, message: 'Storage zone deleted successfully' };
        } else {
            return { success: false, message: response.data.Message || response.statusText };
        }
    } catch (error) {
        console.error('Error deleting storage zone:', error.message);
        return { success: false, message: 'Error deleting storage zone' };
    }
};

exports.deletePullZone = async (zoneId) => {
    try {
        const url = `https://api.bunny.net/pullzone/${zoneId}`;
        const response = await axios.delete(url, {
            headers: {
                'AccessKey': "77fef308-e724-4562-ad1f-535dd7c30fd6e9e6d59e-e166-441f-bc2e-d097dd56f253",
                'Accept': 'application/json'
            }
        });

        if (response.status === 200) {
            return { success: true, message: 'Pull zone deleted successfully' };
        } else {
            return { success: false, message: response.data.Message || response.statusText };
        }
    } catch (error) {
        console.error('Error deleting pull zone:', error.message);
        return { success: false, message: 'Error deleting pull zone' };
    }
};

//Create Folder
exports.createFolder = async (storageZoneName, folderPath, apikey) => {
    try {
        const url = `https://storage.bunnycdn.com/${storageZoneName}/${folderPath}/`;
        const response = await axios.put(url, null, {
            headers: {
                'AccessKey': apikey,
                'Content-Type': 'application/octet-stream'
            }
        });

        if (response.status === 201) {
            console.log('Folder created successfully');
            return { success: true, message: 'Folder created successfully' };
        } else {
            console.log('Failed to create folder', response.statusText);
            return { success: false, message: response.statusText };
        }
    } catch (error) {
        console.error('Error creating folder:', error.message);
        throw error;
    }
};
//check for folder present or not
exports.checkFolderExists = async (storageZoneName, folder,apikey) => {

    try {
        const path='/'
        const response = await axios.get(`https://storage.bunnycdn.com/${storageZoneName}/`, {
            headers: {
                'AccessKey': apikey
            }
        });
        let items=response.data;
        for(let item of items)
            {
                if(item.ObjectName===String(folder))
                    {
                        return true;
                    }
            }
            return false;
    } catch (error) {
        console.error('Error checking folder existence:', error.message);
        return false;
    }
};

//store file on stored zone
exports.handleFileUpload = async (file,folder) => {
    const uniqueFilename = `${Date.now()}-${file.filename}-${file.originalname}`;
    const subdirectory =  folder
    const url = `https://storage.bunnycdn.com/${process.env.BUNNY_ZONE_NAME}/${subdirectory}/${uniqueFilename}`;
    const publicUrl = `https://${process.env.BUNNY_PULL_ZONE_NAME}.b-cdn.net/${subdirectory}/${uniqueFilename}`;
    const fileContent = fs.readFileSync(file.path);
    try {
      const response = await axios.put(url, fileContent, {
        headers: {
          'AccessKey': process.env.BUNNY_ZONE_KEY, 
          'Content-Type': 'application/octet-stream',
        },
      });
  
      if (response.status === 201) {
        console.log('File uploaded successfully');
        
        // Delete the file from the local filesystem
        fs.unlinkSync(file.path, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted from local filesystem');
          }
        });
        return publicUrl;
      } else {
        console.log('Failed to upload file', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };



  // Function to format file sizes
  function formatFileSize(bytes) {
      const KB = 1024;
      const MB = KB * 1024;
      const GB = MB * 1024;
  
      if (bytes >= GB) {
          return (bytes / GB).toFixed(2) + ' GB';
      } else if (bytes >= MB) {
          return (bytes / MB).toFixed(2) + ' MB';
      } else {
          return (bytes / KB).toFixed(2) + ' KB';
      }
  }
  
//   exports.getTotalStorage = async (totalSpaceForDir,path = '/') => {
//       try {
//           const response = await axios.get(`https://storage.bunnycdn.com/${process.env.BUNNY_ZONE_NAME}${path}`, {
//               headers: {
//                   'AccessKey': process.env.BUNNY_ZONE_KEY
//               }
//           });
  
//           const items = response.data;
//           let totalSize = 0;
  
//           const folderSizes = {};
  
//           for (const item of items) {
//               if (item.IsDirectory) {
//                   const subDirectorySize = await exports.getTotalStorage(process.env.BUNNY_ZONE_NAME, `${path}${item.ObjectName}/`);
//                    totalSpaceForDir = totalSpaceForDir; 
//                   const availableSpaceForDir = Math.max(totalSpaceForDir - subDirectorySize.totalSizeBytes, 0); // Calculate available space for subdirectory
//                   folderSizes[item.ObjectName] = {
//                       totalSpace: formatFileSize(totalSpaceForDir), 
//                       availableSpace: formatFileSize(availableSpaceForDir) 
//                   };
//                   totalSize += subDirectorySize.totalSizeBytes; 
//               } else {
//                   totalSize += item.Length; 
//               }
//           }
  
//           // Calculate total space in bytes (100 GB)
//           const totalSpaceBytes = 100 * 1024 * 1024 * 1024;
  
//           // Calculate available space ensuring it's not negative
//           const availableSpaceBytes = Math.max(totalSpaceBytes - totalSize, 0);
  
//           // Format total space and available space
//           const formattedTotalSpace = formatFileSize(totalSpaceBytes);
//           const formattedAvailableSpace = formatFileSize(availableSpaceBytes);
  
//           return {
//               folderSizes,
//               totalSpace: formattedTotalSpace,
//               availableSpace: formattedAvailableSpace,
//               totalSizeBytes: totalSize 
//           };
//       } catch (error) {
//           console.error('Error fetching storage zone info:', error.message);
//           throw error;
//       }
//   };
exports.getTotalStorage = async (storageZoneName, path = '/') => {
    try {
        const response = await axios.get(`https://storage.bunnycdn.com/${storageZoneName}${path}`, {
            headers: {
                'AccessKey': "10457531-1fe8-446e-8c74bf1fbad4-95b1-40ca"
            }
        });

        const items = response.data;
        let totalSize = 0;

        const folderSizes = {}; // Object to store folder-wise used space

        for (const item of items) {
            if (item.IsDirectory) {
                const subDirectorySize = await exports.getTotalStorage(storageZoneName, `${path}${item.ObjectName}/`);
                folderSizes[item.ObjectName] = formatFileSize(subDirectorySize.totalSizeBytes); // Store formatted used space
                totalSize += subDirectorySize.totalSizeBytes; // Accumulate total size used by directories
            } else {
                totalSize += item.Length; // Add the size of files directly
            }
        }

        return {
            folderSizes,
            totalSizeBytes: totalSize // Include total size in bytes for internal calculations
        };
    } catch (error) {
        console.error('Error fetching storage zone info:', error.message);
        throw error;
    }
};
